import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import fetch from 'node-fetch';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { saveTokenPersisted, getTokenEntry, refreshIfNeeded, listAllTokens, removeToken } from './services/driveTokenService';

dotenv.config();

// In-memory map for storing OAuth tokens (for demo / dev only)
const driveTokens = new Map<string, any>();

// If mongoose connected, tokens are persisted using the DriveToken model + driveTokenService.

// Normalize base URL and redirect URI to avoid mismatches
const providedBaseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5050}`).replace(/\/+$/g, '');
const defaultRedirect = `${providedBaseUrl}/auth/google/callback`;
const providedRedirectUri = process.env.GOOGLE_REDIRECT_URI ? process.env.GOOGLE_REDIRECT_URI.replace(/\/+$/g, '') : undefined;
const BASE_URL = providedBaseUrl;
const GOOGLE_REDIRECT_URI = providedRedirectUri || defaultRedirect;

// Helpful logging if redirect mismatches expected default
if (providedRedirectUri && providedRedirectUri !== defaultRedirect) {
  console.warn('[OAuth] WARNING: GOOGLE_REDIRECT_URI environment variable does not match computed default.', { providedRedirectUri, defaultRedirect });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const parsed = insertDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid document data", details: parsed.error });
      }
      const document = await storage.createDocument(parsed.data);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.updateDocument(req.params.id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Google Drive OAuth start
  app.get('/auth/google', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
    const state = nanoid();
    // store state in memory (could be improved with session)
    // scopes: drive.file allows read/write to files created by the app
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    // Log the exact URL we redirect to so it's easy to debug redirect_uri_mismatch issues
    console.log('[OAuth] Redirecting to Google OAuth URL:', url);
    res.redirect(url);
  });

  // OAuth callback - exchange code for tokens and return a small page that posts tokenId back to opener
  app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    if (!code) return res.status(400).send('Missing code');

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokenJson: any = await tokenRes.json();
      // store tokens either in DB (if connected) or memory (dev/demo)
      const tokenId = nanoid();
      // const dbPayload = { tokenId, token: tokenJson, createdAt: Date.now() };
      try {
        if (mongoose.connection.readyState === 1 && process.env.ENABLE_PERSISTENCE === 'true') {
          // store persistent token (encrypted) in DB
          await saveTokenPersisted(tokenId, tokenJson);
        } else {
          const createdAt = Date.now();
          const expiresIn = tokenJson.expires_in ? Number(tokenJson.expires_in) : undefined;
          const expiresAt = expiresIn ? createdAt + expiresIn * 1000 : undefined;
          driveTokens.set(tokenId, { token: tokenJson, createdAt, expiresAt });
        }
      } catch (err) {
        console.warn('[OAuth] Failed to persist token:', err);
        const createdAt = Date.now();
        const expiresIn = tokenJson.expires_in ? Number(tokenJson.expires_in) : undefined;
        const expiresAt = expiresIn ? createdAt + expiresIn * 1000 : undefined;
        driveTokens.set(tokenId, { token: tokenJson, createdAt, expiresAt });
      }

      // Return an HTML page that posts message to opener and closes
      const postPayload = JSON.stringify({ tokenId });
      return res.send(`<!doctype html><html><body>
        <script>
          try {
            window.opener && window.opener.postMessage(${postPayload}, '*');
          } catch(e) {}
          document.write('Connected. You can close this window.');
        </script>
      </body></html>`);
    } catch (err) {
      console.error('OAuth exchange failed', err);
      return res.status(500).send('OAuth exchange failed');
    }
  });

  // Status for a tokenId
  app.get('/api/drive/status/:tokenId', (req, res) => {
    const tokenId = req.params.tokenId;
    // check DB first
    (async () => {
      try {
        if (mongoose.connection.readyState === 1 && process.env.ENABLE_PERSISTENCE === 'true') {
          const entry = await getTokenEntry(tokenId);
          if (!entry) return res.status(404).json({ connected: false });
          return res.json({ connected: true, createdAt: entry.createdAt || null, expiresAt: entry.expiresAt || null, scope: entry.scope || null });
        }
        const entry = driveTokens.get(tokenId);
        if (!entry) return res.status(404).json({ connected: false });
        return res.json({ connected: true, createdAt: entry.createdAt, expiresAt: entry.expiresAt || null, scope: null });
      } catch (err) {
        console.error('Drive status error', err);
        return res.status(500).json({ connected: false });
      }
    })();
  });

  // List all persisted Drive tokens (DB only)
  app.get('/api/drive/tokens', async (req, res) => {
    try {
      if (mongoose.connection.readyState === 1 && process.env.ENABLE_PERSISTENCE === 'true') {
        const all = await listAllTokens();
        return res.json({ tokens: all });
      }
      // Fallback: return in-memory tokens
      const items: Array<{ tokenId: string; createdAt?: number; expiresAt?: number; scope?: string }> = [];
      for (const [tokenId, entry] of Array.from(driveTokens.entries())) {
        items.push({ tokenId, createdAt: entry.createdAt, expiresAt: entry.expiresAt, scope: entry.token?.scope || null });
      }
      return res.json({ tokens: items });
    } catch (err) {
      console.error('Drive tokens list error', err);
      return res.status(500).json({ error: 'Failed to list tokens' });
    }
  });

  // Delete a persisted Drive token
  app.delete('/api/drive/tokens/:tokenId', async (req, res) => {
    try {
      if (!(mongoose.connection.readyState === 1 && process.env.ENABLE_PERSISTENCE === 'true')) {
        // If not persistent, delete in-memory token
        const tokenId = req.params.tokenId;
        const existed = driveTokens.delete(tokenId);
        return res.json({ success: !!existed });
      }
      const tokenId = req.params.tokenId;
      await removeToken(tokenId);
      return res.json({ success: true });
    } catch (err) {
      console.error('Drive token delete error', err);
      return res.status(500).json({ error: 'Failed to delete token' });
    }
  });

  // Info: which storage implementation is currently active
  app.get('/api/storage-type', (req, res) => {
    const type = process.env.ENABLE_PERSISTENCE === 'true' && process.env.MONGO_URI ? 'mongo' : 'memory';
    res.json({ storageType: type });
  });

  // Debug helper for OAuth settings
  app.get('/api/oauth-info', (req, res) => {
    res.json({
      BASE_URL,
      computedDefaultRedirect: defaultRedirect,
      providedRedirectUri: providedRedirectUri || null,
      usedRedirectUri: GOOGLE_REDIRECT_URI,
    });
  });

  // Upload file to Drive using stored tokenId. Accepts JSON { tokenId, name, mimeType, content } where content is base64 or text.
  app.post('/api/drive/upload', async (req, res) => {
      try {
        const { tokenId, name, mimeType, content } = req.body as { tokenId?: string; name?: string; mimeType?: string; content?: string };
      if (!tokenId) return res.status(400).json({ error: 'Not connected' });

      let accessToken: string | undefined = undefined;
      try {
        if (mongoose.connection.readyState === 1 && process.env.ENABLE_PERSISTENCE === 'true') {
          const refreshed = await refreshIfNeeded(tokenId);
          if (!refreshed) return res.status(400).json({ error: 'Not connected' });
          accessToken = refreshed.access_token;
        } else {
          if (!driveTokens.has(tokenId)) return res.status(400).json({ error: 'Not connected' });
          const tokenEntry = driveTokens.get(tokenId);
          // If memory-stored tokens have expiresAt saved, refresh if needed
          const now = Date.now();
          if (tokenEntry.expiresAt && tokenEntry.expiresAt - now < 60 * 1000) {
            // attempt to refresh in-memory token using refresh_token
            const refreshToken = tokenEntry.token?.refresh_token;
            if (refreshToken) {
              const clientId = process.env.GOOGLE_CLIENT_ID || '';
              const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
              const params = new URLSearchParams();
              params.set('client_id', clientId);
              params.set('client_secret', clientSecret);
              params.set('grant_type', 'refresh_token');
              params.set('refresh_token', refreshToken);
              const tokenRes = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
              if (tokenRes.ok) {
                const tokenJson: any = await tokenRes.json();
                tokenEntry.token.access_token = tokenJson.access_token;
                const expiresIn = tokenJson.expires_in ? Number(tokenJson.expires_in) : undefined;
                tokenEntry.expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : tokenEntry.expiresAt;
              }
            }
          }
          accessToken = tokenEntry.token?.access_token;
        }
      } catch (err) {
        console.error('Drive token fetch error', err);
        return res.status(500).json({ error: 'Token fetch error' });
      }
      if (!accessToken) return res.status(400).json({ error: 'No access token' });

      // Build multipart request
      const metadata = { name: name || 'document', mimeType: mimeType || 'text/plain' };

      const boundary = '-------TypeWriterProBoundary' + Date.now();
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metaPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
      const filePartHeader = `Content-Type: ${mimeType || 'text/plain'}\r\n\r\n`;

      const bodyParts: any[] = [];
      bodyParts.push(Buffer.from(delimiter + metaPart));
      bodyParts.push(Buffer.from(`\r\n--${boundary}\r\n` + filePartHeader));
      bodyParts.push(Buffer.from(content || ''));
      bodyParts.push(Buffer.from(closeDelimiter));

      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: Buffer.concat(bodyParts),
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) return res.status(500).json({ error: 'Upload failed', details: uploadJson });
      res.json({ success: true, file: uploadJson });
    } catch (err) {
      console.error('Drive upload error', err);
      res.status(500).json({ error: 'Upload error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
