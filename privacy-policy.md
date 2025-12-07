# Privacy Policy — TypeWriterPro

Last updated: December 7, 2025

This Privacy Policy explains how TypeWriterPro (“we”, “our”, “us”, or the “Service”) collects, uses, discloses and protects personal data when you use the TypeWriterPro application, website, and related services (the “App” or “Service”). This policy also explains your choices and rights with respect to your personal data.

If you are using TypeWriterPro on behalf of an organization, the organization is the data controller and must ensure compliance with applicable laws.

## 1. Data Controller & Contact

- Data Controller: TypeWriterPro Inc. (or the current owner of the repository)
- Contact Email: parssstore.ir@gmail.com

Please replace the contact email above with an address that will be monitored by your organization. This address is used for privacy inquiries, data removal requests, and to comply with OAuth verification requests.

## 2. What information we collect

We aim to collect the minimum data necessary to provide the Service. The types of information we may collect include:

1. Account Information (Optional)
   - If you sign in via Google OAuth for Drive integration, we collect the minimal OAuth tokens and profile information that Google provides (e.g., email, name, profile ID) to permit sign-in and save files to your Google Drive.

2. Files & Documents (User Content)
   - When you use the Google Drive integration to save documents, TypeWriterPro may access the files that you choose to save. We only access files you explicitly create or grant the app permission to access.

3. Usage Data & Diagnostics
   - Non-identifying technical data such as app version, feature usage, and error logs to improve reliability and performance.

4. Local Data
   - Documents and preferences saved in your browser localStorage are stored locally and not transmitted to us unless you choose to use cloud storage features (e.g., Save to Google Drive).

## 3. Third-party services and OAuth scopes

TypeWriterPro integrates optional third-party services. When you enable these features, you are consenting to the corresponding third-party access:

- Google Drive OAuth2 (Sign-in & Save to Drive)
  - OAuth scopes requested:
    - `https://www.googleapis.com/auth/drive.file` — Allows the app to read and write the files it creates or the files explicitly opened with the app. We use this scope to upload document files you choose to save.
    - `https://www.googleapis.com/auth/drive.metadata` — Allows the app to view and manage metadata for files in your Google Drive for management operations.
  - Why we need these: to allow users to store and manage documents in their Google Drive account directly from TypeWriterPro without requiring you to manually download and re-upload files.
  - How we use tokens: OAuth tokens are used only to perform user-authorized Drive operations. Refresh tokens (if issued) are stored securely on the server (development/demo uses in-memory store; in production you should use an encrypted server-side store). You may revoke access at any time from your Google Account settings.

Other third-party services used for functionality (e.g., Google Fonts, CDN providers) may load resources from their servers. We do not control the privacy practices of those third parties; consult their privacy policies.

## 4. How we use your data

We use collected data for the following purposes:

- Provide and maintain the Service
- Process save / export operations to Google Drive (user-initiated)
- Improve app features and performance (analytics and debugging)
- Communicate with you regarding critical updates or support requests
- Comply with legal obligations

We do NOT sell your personal information.

## 5. Data retention

- User-generated documents saved only to localStorage remain on the user device until deleted by the user.
- Files uploaded to Google Drive are stored in your Google Drive account and subject to Google’s retention and deletion rules.
- OAuth tokens and metadata stored by TypeWriterPro are retained only as long as needed to provide the connected Drive functionality, or as required by law. In demo/dev deployments tokens may be stored in memory and are not persisted. In production you should implement secure persistence and allow users to disconnect which deletes tokens.

## 6. Sharing and disclosure

We do not share personal data with third parties except in the following situations:

- With your consent (e.g., when you choose to save a file to Google Drive or share a document)
- To comply with legal obligations, government requests, or valid legal process
- To protect our rights, property, or safety or those of others

## 7. Your rights

Depending on your jurisdiction, you may have rights regarding your personal data (access, correction, deletion, data portability, restriction of processing). To exercise these rights, contact parssstore.ir@gmail.com . We will respond to requests in accordance with applicable law.

## 8. Security

We take reasonable organizational and technical measures to protect personal data. However, no online service can be guaranteed to be 100% secure. For production deployments, secure the server environment, use HTTPS, and store secrets and tokens encrypted.

## 9. Children

The Service is not intended for children under 13 (or local minimum age). We do not knowingly collect information from children under the minimum age. If you believe we have collected data from a child, contact us at parssstore.ir@gmail.com to request deletion.

## 10. Changes to this policy

We may update this Privacy Policy from time to time. We will post the updated policy on this page with the "Last updated" date. Continued use of the Service after changes indicates acceptance of the updated policy.

## 11. Contact

If you have questions or concerns about this Privacy Policy or would like to exercise your privacy rights, contact us at:

parssstore.ir@gmail.com


---

**Notes for Google OAuth Verification**

- Human-readable (Markdown rendered):
  `https://github.com/Aparsa40/typewritepro/blob/master/privacy-policy.md`

- Raw file (direct link):
  `https://raw.githubusercontent.com/Aparsa40/typewritepro/master/privacy-policy.md`

Make sure the contact email in this document is valid and monitored.
