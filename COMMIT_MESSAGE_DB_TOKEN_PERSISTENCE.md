# Add secure DB-backed Google Drive OAuth token persistence, auto-refresh, and management utilities

Summary:

- Implement persistent storage for Drive OAuth tokens using MongoDB + Mongoose and encrypted token fields (AES-256-GCM).
- Add a DriveToken model, a token service (`driveTokenService.ts`) for saving/getting/refreshing tokens and listing/removing persisted tokens.
- Add a scheduler (`driveTokenScheduler.ts`) that periodically checks persisted tokens and refreshes near-expiry tokens automatically.
- Add routes to list and delete tokens, and to return token connection status. Ensure the UI has a manage dialog for Drive connections (`MenuBar.tsx` changes), and updated client-side save flow.
- Support in-memory fallback tokens in dev (store tokens in a map) while providing the management endpoints to list or delete tokens for UI usability.
- Add an env pre-check script (`server/scripts/checkEnv.ts`) to ensure `OAUTH_TOKEN_ENCRYPTION_KEY` is set when using persistence and that Drive integration env vars are present. Also, startup aborts when persistence is enabled but encryption key missing.
- Export encryption helpers (`server/utils/tokenEncryption.ts`) with `isKeyEphemeral()` for diagnostics and validation.
- Add an integration test script to verify save/read/delete flows for DB persistence (`server/tests/driveToken_integration.ts`).
- Add docs updates in `DEV_TESTING.md` about the new endpoints, scheduler, and key requirements.

Files added:

- `server/models/driveToken.ts` - Mongoose schema for persisted OAuth tokens (encrypted fields) with createdAt/updatedAt/expiresAt.
- `server/services/driveTokenService.ts` - Save, read, refresh, and remove token utility functions; encryption handled in the service; fallback logic for older `token` fields.
- `server/services/driveTokenScheduler.ts` - Optional background scheduler for proactive token refresh.
- `server/scripts/checkEnv.ts` - Environment validation script to ensure the necessary env vars for persistence & Drive integration.
- `server/tests/driveToken_integration.ts` - Integration test for DB-backed token save/read/delete (requires MONGO_URI).

Files updated (major):

- `server/routes.ts` - Use token service to persist and refresh tokens; add token management endpoints (list, delete, status); in-memory fallback is still supported.
- `server/index-dev.ts` & `server/index-prod.ts` - Validate encryption key and create DriveToken indexes after connecting to Mongo; startup aborts if persistence is enabled but key missing.
- `server/utils/tokenEncryption.ts` - AES-256-GCM encryption and helper `isKeyEphemeral()`.
- `client/src/components/editor/MenuBar.tsx` - UI: Add a "Manage Drive Connections" menu and dialog to list/remove persisted connections (works for both persistent and in-memory modes).
- `docs/DEV_TESTING.md` - Document new endpoints and env requirements.
- `package.json` - Add `test:drive-tokens` (existing) and `check-env` script; update `npm run dev` remains as is.

Testing & Validation:

- `npm run check` (TypeScript compile)
- `npm run check-env` (verify env variables)
- `npm run test:drive-tokens` (integration test; requires `MONGO_URI` & `OAUTH_TOKEN_ENCRYPTION_KEY`)
- Run locally: `npm run dev` and verify Google Drive connection + token persistence; `GET /api/drive/tokens` should list persisted items and `DELETE /api/drive/tokens/:tokenId` should remove them.

Notes & Next Steps:

- Consider adding a background scheduler also for in-memory tokens for local very long-living dev servers, or for rotating refresh tokens on a schedule.
- Add E2E tests to validate refresh behavior when Google returns new access/refresh tokens.
- Consider adding a page in the UI to show token audit logs and expiration times.

Commit message suggestion:

- Title: Add encrypted DB-backed storage and refresh for Google Drive OAuth tokens
- Body (short): Implement DriveToken persistence, encrypt tokens at rest (AES-256-GCM), add refresh-on-demand and periodic refresh scheduler, add management endpoints/UI, and enforce encryption key presence for persistence.

END
