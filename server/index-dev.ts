import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import { nanoid } from "nanoid";
import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";

import viteConfig from "../vite.config";
import runApp from "./app";

// ----------------------
// اضافه شده: اتصال به MongoDB Atlas
// ----------------------
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { ensureIndex as ensureDriveTokenIndex } from './services/driveTokenService';
import { isKeyEphemeral } from './utils/tokenEncryption';

async function connectMongo() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set; skipping MongoDB connection. Running with in-memory MemStorage unless ENABLE_PERSISTENCE is configured.');
      return;
    }
    // If persistence enabled, require OAUTH_TOKEN_ENCRYPTION_KEY to be set
    if (process.env.ENABLE_PERSISTENCE === 'true' && !process.env.OAUTH_TOKEN_ENCRYPTION_KEY) {
      console.error('ENABLE_PERSISTENCE=true but OAUTH_TOKEN_ENCRYPTION_KEY is not set - refusing to start in dev to avoid storing unencrypted tokens');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: "typewritepro"
    });
    console.log("Connected to MongoDB Atlas!");
    if (process.env.ENABLE_PERSISTENCE === 'true' && isKeyEphemeral()) {
      console.error('ENABLE_PERSISTENCE is true but OAUTH_TOKEN_ENCRYPTION_KEY is not set. Aborting startup.');
      process.exit(1);
    }
    try { await ensureDriveTokenIndex(); } catch (e) { console.warn('Failed to ensure DriveToken index', e); }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
// ----------------------


export async function setupVite(app: Express, server: Server) {
  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      const page = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

(async () => {
  // اول دیتابیس وصل می‌شه
  await connectMongo();

  // بعد اپ اجرا می‌شه
  await runApp(setupVite);
})();
