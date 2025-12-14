import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { DriveToken } from '../models/driveToken';
import { encryptString, decryptString, encryptJSON, decryptJSON } from '../utils/tokenEncryption';

const REFRESH_THRESHOLD_MS = 60 * 1000; // if token expires within 60s, refresh proactively

function nowMs() { return Date.now(); }

export async function saveTokenPersisted(tokenId: string, tokenJson: any): Promise<void> {
  const access = tokenJson.access_token;
  const refresh = tokenJson.refresh_token;
  const expiresIn = tokenJson.expires_in ? Number(tokenJson.expires_in) : undefined;
  const expiresAt = expiresIn ? nowMs() + expiresIn * 1000 : undefined;
  const scope = tokenJson.scope || '';
  const tokenType = tokenJson.token_type || '';
  const createdAt = nowMs();
  const updatedAt = createdAt;

  const doc = {
    tokenId,
    accessTokenEncrypted: access ? encryptString(access) : undefined,
    refreshTokenEncrypted: refresh ? encryptString(refresh) : undefined,
    expiresAt,
    scope,
    tokenType,
    createdAt,
    updatedAt,
  };

  await DriveToken.findOneAndUpdate({ tokenId }, doc, { upsert: true, new: true }).exec();
}

export async function getTokenEntry(tokenId: string): Promise<null | {
  tokenId: string;
  access_token?: string;
  refresh_token?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
  createdAt?: number;
  updatedAt?: number;
}> {
  if (mongoose.connection.readyState === 1) {
    const doc = await DriveToken.findOne({ tokenId }).lean().exec();
    if (!doc) return null;
    let access_token = doc.accessTokenEncrypted ? decryptString(doc.accessTokenEncrypted) : undefined;
    let refresh_token = doc.refreshTokenEncrypted ? decryptString(doc.refreshTokenEncrypted) : undefined;
    // backward-compat fallback: some earlier DB rows may have `token` field with raw tokens
    if ((!access_token || !refresh_token) && doc.token) {
      try {
        const raw = typeof doc.token === 'string' ? JSON.parse(doc.token as string) : doc.token;
        access_token = access_token || raw.access_token || raw.accessToken;
        refresh_token = refresh_token || raw.refresh_token || raw.refreshToken;
        if (!doc.expiresAt && raw.expires_in && doc.createdAt) {
          // compute expiresAt from stored createdAt for the old format
          const createdAt = Number(doc.createdAt);
          if (!Number.isNaN(createdAt)) {
            (doc as any).expiresAt = createdAt + Number(raw.expires_in) * 1000;
          }
        }
      } catch (e) {
        // ignore fallback parse errors
      }
    }
    return {
      tokenId: doc.tokenId,
      access_token,
      refresh_token,
      expiresAt: doc.expiresAt,
      scope: doc.scope,
      tokenType: doc.tokenType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
  return null;
}

async function updateAccessToken(tokenId: string, newAccessToken: string, newExpiresAt?: number, maybeNewRefresh?: string) {
  const update: any = {
    accessTokenEncrypted: encryptString(newAccessToken),
    updatedAt: nowMs(),
  };
  if (newExpiresAt) update.expiresAt = newExpiresAt;
  if (maybeNewRefresh) update.refreshTokenEncrypted = encryptString(maybeNewRefresh);
  await DriveToken.findOneAndUpdate({ tokenId }, update, { upsert: false }).exec();
}

export async function refreshIfNeeded(tokenId: string): Promise<{ access_token: string } | null> {
  const entry = await getTokenEntry(tokenId);
  if (!entry) return null;

  if (!entry.expiresAt) return { access_token: entry.access_token || '' };

  const timeLeft = entry.expiresAt - nowMs();
  if (timeLeft > REFRESH_THRESHOLD_MS) {
    return { access_token: entry.access_token || '' };
  }

  // Need to refresh
  if (!entry.refresh_token) throw new Error('No refresh token available');

  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) throw new Error('Missing Google client credentials for token refresh');

  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', entry.refresh_token);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Token refresh failed: ${tokenRes.status} ${text}`);
  }
  const tokenJson: any = await tokenRes.json();
  if (!tokenJson.access_token) throw new Error('Refresh response missing access token');

  const newAccessToken = tokenJson.access_token;
  const newExpiresIn = tokenJson.expires_in ? Number(tokenJson.expires_in) : undefined;
  const newExpiresAt = newExpiresIn ? nowMs() + newExpiresIn * 1000 : undefined;
  const maybeNewRefresh = tokenJson.refresh_token; // Google may or may not return a new refresh token

  await updateAccessToken(tokenId, newAccessToken, newExpiresAt, maybeNewRefresh);

  return { access_token: newAccessToken };
}

export async function removeToken(tokenId: string): Promise<void> {
  await DriveToken.deleteOne({ tokenId }).exec();
}

export async function ensureIndex() {
  await DriveToken.createIndexes();
}

export async function listAllTokens(): Promise<Array<{ tokenId: string; createdAt?: number; updatedAt?: number; expiresAt?: number; scope?: string }>> {
  if (mongoose.connection.readyState !== 1) return [];
  const docs = await DriveToken.find({}).lean().exec();
  return docs.map((d: any) => ({ tokenId: d.tokenId, createdAt: d.createdAt, updatedAt: d.updatedAt, expiresAt: d.expiresAt, scope: d.scope }));
}
