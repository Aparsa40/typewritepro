import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";
import mongoose from 'mongoose';
import { ensureIndex as ensureDriveTokenIndex } from './services/driveTokenService';

export async function serveStatic(app: Express, _server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Log if a service worker is present. Serve without it still works but PWA features may require HTTPS.
  const swPath = path.join(distPath, "service-worker.js");
  if (fs.existsSync(swPath)) {
    console.log(`Service Worker detected at ${swPath}. Make sure to serve via HTTPS in production for full PWA features.`);
  }

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  // If MONGO_URI is present in the environment, connect to Mongo in production
  try {
    if (process.env.MONGO_URI) {
      if (process.env.ENABLE_PERSISTENCE === 'true' && !process.env.OAUTH_TOKEN_ENCRYPTION_KEY) {
        console.error('ENABLE_PERSISTENCE=true but OAUTH_TOKEN_ENCRYPTION_KEY is not set - refusing to start to avoid storing unencrypted tokens');
        process.exit(1);
      }
      await mongoose.connect(process.env.MONGO_URI!, { dbName: process.env.DB_NAME || 'typewritepro' });
      console.log('Connected to MongoDB (production)');
      try { await ensureDriveTokenIndex(); } catch (e) { console.warn('Failed to ensure DriveToken index', e); }
    }
  } catch (err) {
    console.warn('Failed to connect to MongoDB in production startup (continuing):', err);
  }
  await runApp(serveStatic);
})();
