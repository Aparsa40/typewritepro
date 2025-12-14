import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

function err(msg: string) { console.error(msg); process.exit(1); }

const enablePersistence = process.env.ENABLE_PERSISTENCE === 'true';
const hasMongoUri = !!process.env.MONGO_URI;

if (enablePersistence && !hasMongoUri) {
  err('ENABLE_PERSISTENCE=true but MONGO_URI is not set');
}

const isBase64 = (s: string) => {
  try { return Buffer.from(s, 'base64').toString('base64') === s; } catch { return false; }
}

if (enablePersistence && hasMongoUri) {
  const key = process.env.OAUTH_TOKEN_ENCRYPTION_KEY || '';
  if (!key) err('OAUTH_TOKEN_ENCRYPTION_KEY must be set when using persistence (ENABLE_PERSISTENCE=true)');
  if (!isBase64(key)) err('OAUTH_TOKEN_ENCRYPTION_KEY should be set in base64 encoding (32 bytes).');
  try {
    const buf = Buffer.from(key as string, 'base64');
    if (buf.length !== 32) err('OAUTH_TOKEN_ENCRYPTION_KEY should be 32 bytes (base64 length 44).');
  } catch (e) { err('Failed to parse OAUTH_TOKEN_ENCRYPTION_KEY'); }
}

if (process.env.ENABLE_DRIVE_INTEGRATION === 'true') {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    err('ENABLE_DRIVE_INTEGRATION=true requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
  }
}

console.log('Environment check OK');
process.exit(0);
