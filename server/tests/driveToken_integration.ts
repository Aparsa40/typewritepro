import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { saveTokenPersisted, getTokenEntry, removeToken, listAllTokens } from '../services/driveTokenService';

dotenv.config();

async function main() {
  if (!process.env.MONGO_URI) {
    console.log('Skipping test: MONGO_URI not set');
    process.exit(0);
  }

  await mongoose.connect(process.env.MONGO_URI!, { dbName: process.env.DB_NAME || 'typewritepro' });

  const tokenId = 'test-' + nanoid();
  const tokenJson = {
    access_token: 'access-123',
    refresh_token: 'refresh-123',
    expires_in: 3600,
    scope: 'https://www.googleapis.com/auth/drive.file'
  };

  console.log('Saving tokenId', tokenId);
  await saveTokenPersisted(tokenId, tokenJson);

  const entry = await getTokenEntry(tokenId);
  if (!entry) {
    console.error('Failed to read token after save');
    process.exit(2);
  }

  console.log('Entry read back:', { tokenId: entry.tokenId, access: entry.access_token, refresh: entry.refresh_token, expiresAt: entry.expiresAt });

  const list = await listAllTokens();
  const found = list.find(t => t.tokenId === tokenId);
  if (!found) {
    console.error('Token not found in listAllTokens');
    process.exit(3);
  }

  console.log('Removing token', tokenId);
  await removeToken(tokenId);

  const after = await getTokenEntry(tokenId);
  if (after) {
    console.error('Token still present after remove');
    process.exit(4);
  }

  console.log('Drive token integration test PASSED');
  process.exit(0);
}

main().catch((e) => {
  console.error('Test failed', e);
  process.exit(10);
});
