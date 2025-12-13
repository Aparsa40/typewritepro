import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import fs from "fs";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Plugin to copy PWA files (manifest.json, service-worker.js) to dist
    {
      name: 'copy-pwa-files',
      writeBundle: async () => {
        const distPublic = path.resolve(import.meta.dirname, "dist/public");
        const publicDir = path.resolve(import.meta.dirname, "public");

        if (!fs.existsSync(distPublic)) {
          fs.mkdirSync(distPublic, { recursive: true });
        }

        const manifestSrc = path.join(publicDir, "manifest.json");
        const manifestDest = path.join(distPublic, "manifest.json");
        if (fs.existsSync(manifestSrc)) fs.copyFileSync(manifestSrc, manifestDest);

        const swSrc = path.join(publicDir, "service-worker.js");
        const swDest = path.join(distPublic, "service-worker.js");
        if (fs.existsSync(swSrc)) fs.copyFileSync(swSrc, swDest);

        const iconsSrc = path.join(publicDir, "icons");
        const iconsDest = path.join(distPublic, "icons");
        if (fs.existsSync(iconsSrc)) fs.cpSync(iconsSrc, iconsDest, { recursive: true, force: true });

        console.log('✓ PWA files copied to dist');
      }
    },
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
          await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // بخش‌بندی chunk ها برای کاهش حجم فایل اصلی
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // همه پکیج‌های خارجی جدا می‌شوند
          }
          if (id.includes('client/src/components/editor')) {
            return 'editor'; // کامپوننت editor جدا
          }
          if (id.includes('shared')) {
            return 'shared'; // shared جدا
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // هشدار برای chunk های بزرگ‌تر از 1MB
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
