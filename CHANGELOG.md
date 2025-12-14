# Changelog

## Unreleased

- Implemented MongoStorage using Mongoose and environment-based switching (`ENABLE_PERSISTENCE` + `MONGO_URI`) to enable real persistence.
- Added helpful OAuth debug endpoints and logging (`/api/oauth-info`, improved redirect mismatch warnings).
- Improved cursor mapping for table cells in the preview and mapping fallback heuristics.
- Improved per-line direction detection and added `dir` attributes to rendered blocks for accessibility and correct rendering.
- Added a `docs/DEV_TESTING.md` guide for running the app and verifying PWA, OAuth, DB, and editor-preview correctness.
- Added log to `index-prod.ts` to remind about HTTPS for service worker usage.
