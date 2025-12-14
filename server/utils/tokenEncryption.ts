import crypto from 'crypto';

const KEY_ENV = 'OAUTH_TOKEN_ENCRYPTION_KEY';

function base64KeyFromEnv(): Buffer {
  const env = process.env[KEY_ENV];
  if (env && env.length > 0) {
    // Accept raw base64 or hex, try base64 first
    try {
      return Buffer.from(env, 'base64');
    } catch (e) {
      return Buffer.from(env, 'hex');
    }
  }

  // Generate ephemeral key for dev if missing; warn
  const key = crypto.randomBytes(32);
  if (process.env.ENABLE_PERSISTENCE === 'true') {
    throw new Error(`Environment variable ${KEY_ENV} must be set when ENABLE_PERSISTENCE=true`);
  }
  console.warn(`[tokenEncryption] ${KEY_ENV} not set; generated ephemeral key for dev (not persisted)`);
  return key;
}

const KEY = base64KeyFromEnv();

export function encryptString(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

export function decryptString(encrypted: string): string {
  const parts = encrypted.split('.');
  if (parts.length !== 3) throw new Error('Invalid encrypted payload');
  const iv = Buffer.from(parts[0], 'base64');
  const tag = Buffer.from(parts[1], 'base64');
  const data = Buffer.from(parts[2], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptJSON(obj: any): string {
  return encryptString(JSON.stringify(obj));
}

export function decryptJSON(encrypted: string): any {
  const plain = decryptString(encrypted);
  try { return JSON.parse(plain); } catch (e) { return plain; }
}

export function isKeyEphemeral(): boolean {
  return !process.env[KEY_ENV] || process.env[KEY_ENV].length === 0;
}
