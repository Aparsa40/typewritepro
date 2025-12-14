# Development & Testing Guide

This document walks through running the application locally for full-stack testing (PWA, service worker, MongoDB persistence, Google Drive OAuth), and provides a checklist for verifying editor/preview mechanics.

## Prerequisites

- Node 18+ and npm
- Optional: MongoDB Atlas account or local Mongo
- Optional: Google Cloud project for OAuth

## Setup

1. Copy `.env.example` to `.env` and set values:

```env
# Server
PORT=5050
NODE_ENV=development
SESSION_SECRET=replace-me

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
BASE_URL=http://localhost:5050
GOOGLE_REDIRECT_URI=http://localhost:5050/auth/google/callback

# DB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
ENABLE_PERSISTENCE=true
ENABLE_DRIVE_INTEGRATION=true

# Optional: Encrypted token storage key (recommended for production)
# Generate a 32-byte key and set it as base64 (e.g., `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
OAUTH_TOKEN_ENCRYPTION_KEY=
```

## Running Dev

1. `npm install`
2. `npm run dev`

The server runs in dev middleware mode with Vite. If `MONGO_URI` is set, it will try to connect to Mongo.

## Running a Production-like Server (for PWA)

1. `npm run build`
2. `NODE_ENV=production npm run start` (or on PowerShell: `$env:NODE_ENV='production'; npm run start`)

This serves the `dist/public` statically on the configured port. Service worker registration will happen from the client index.

## Helpful Debug Endpoints

- `GET /api/oauth-info` — shows `BASE_URL`, `computedDefaultRedirect`, `providedRedirectUri`, and final `usedRedirectUri` so you can confirm redirect matches the registered OAuth credential in Google Cloud Console.
- `GET /api/storage-type` — returns either `mongo` or `memory` depending on whether persistence is enabled and MONGO_URI is present.
- `GET /api/drive/tokens` — list persisted Drive tokens (DB only).
- `DELETE /api/drive/tokens/:tokenId` — remove persisted Drive token.
- UI: 'Manage Drive Connections' menu entry in File -> Export -> Drive (shows persisted tokens and allows removing them).

## Checklist to Validate Functionality

### PWA

- Ensure service worker is registered in production build (Application → Service Workers).
- Validate offline behavior by enabling offline in DevTools and reloading.

### Google Drive (OAuth)

- Click Connect Drive in the UI or visit `/auth/google`.
- Confirm the callback returns a `tokenId` via postMessage and verify `driveTokens` exists (dev only).
- Test `/api/drive/upload` with the tokenId.
- If `ENABLE_PERSISTENCE=true` and a `MONGO_URI` is configured, OAuth tokens are persisted to the DB; otherwise tokens are stored temporarily in memory (dev/demo).
- If persistence is enabled, a background scheduler will periodically refresh expiring tokens automatically.

### MongoDB Persistence

- If using `mongo` storage, validate with `GET /api/documents` and verify in your DB.
- Create, update, delete documents and confirm changes persist.

### Editor > Preview sync

- Cursor moves in editor should scroll/center preview to the corresponding line.
- Clicking the preview should move the editor caret to the expected line/column.
- For Markdown tables, verify the click-to-caret mapping roughly matches table cells.

### Directionality

- Test single lines of English (LTR) and Persian (RTL).
- Test mixed lines (English+Persian) and ensure it uses the language with more characters.
- Plain text with multiple lines should auto-direction per line without needing blank lines between languages.

### Images & Image Editor Overlay

- Insert images via Markdown or HTML.
- Click image in preview to open overlay; test drag/resize and Save updates content.

## Notes and Tips

- If you see `redirect_uri_mismatch` during OAuth, confirm the `GOOGLE_REDIRECT_URI` in `.env` exactly matches your OAuth client settings; use `/api/oauth-info` to investigate.
- Token refresh scheduler: When using DB persistence, the server runs a background scheduler that refreshes tokens close to expiry. You can inspect persisted tokens with `GET /api/drive/tokens` and remove them with `DELETE /api/drive/tokens/:tokenId`.
- `ENABLE_PERSISTENCE=true` with no `MONGO_URI` will still use in-memory storage — set `MONGO_URI` to enable real persistence.

## Troubleshooting

- If service worker doesn't register, ensure you run the production-like server and that you aren't accessing via `file://`.

## Contributing

- Follow the project's code guidelines and run `npm run check` before creating PRs.
- Integration test for token storage: run `npm run test:drive-tokens` (requires `MONGO_URI` in .env).
