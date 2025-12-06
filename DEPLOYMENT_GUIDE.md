# TypeWriterPro - GitHub & Render.com Deployment Guide

This guide walks you through pushing TypeWriterPro to GitHub and deploying to Render.com.

---

## 📤 Step 1: Prepare for GitHub Push

### 1.1 Initialize Git (if not already done)

```bash
cd f:\All-Projects\All-App-Creater-REPLIT-AiDeveloper\TypeWriterPro
git init
```

### 1.2 Add All Files

```bash
git add .
```

### 1.3 Create Initial Commit

```bash
git commit -m "initial commit: TypeWriterPro professional markdown editor

- Monaco Editor integration for professional editing
- RTL/LTR auto-detection for Farsi/English
- Live Markdown preview
- 6 Markdown helper tools
- Export to MD/HTML/PDF
- Google Drive integration
- Dark/Light theme support
- Proprietary license"
```

### 1.4 Add GitHub Remote

```bash
git remote add origin https://github.com/Aparsa40/typewritepro.git
```

### 1.5 Rename Branch to main (if needed)

```bash
git branch -M main
```

### 1.6 Push to GitHub

```bash
git push -u origin main
```

---

## ✅ Verification Checklist Before Push

Before pushing to GitHub, ensure:

- [ ] `.env` file is **NOT** included (should be in .gitignore)
- [ ] `node_modules/` is in .gitignore (not pushed)
- [ ] `.env.example` exists with placeholder values
- [ ] `README.md` is complete and informative
- [ ] `LICENSE` and `PROPRIETARY_LICENSE` are present
- [ ] `CONTRIBUTING.md` exists
- [ ] `design_guidelines.md` is kept for developers
- [ ] All source code is clean (no console.log, debug code)
- [ ] No sensitive keys or secrets in code

**Check what will be pushed:**

```bash
# See files that will be committed
git status

# Preview files that will be pushed
git diff --cached --name-only
```

---

## 🚀 Step 2: Deploy to Render.com

### 2.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub account (recommended)
3. Authorize Render to access your GitHub repositories

### 2.2 Create New Web Service

1. Dashboard → **New +** → **Web Service**
2. Connect Repository:
   - Select **GitHub**
   - Authorize GitHub connection
   - Choose repository: `typewritepro`
   - Branch: `main`
3. Click **Connect**

### 2.3 Configure Web Service

**Basic Settings:**

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | typewritepro | Service name on Render |
| **Environment** | Node | Runtime environment |
| **Region** | Ohio (default) | Closest to users |
| **Branch** | main | Git branch to deploy |

**Build Settings:**

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### 2.4 Environment Variables

In Render dashboard:

1. Go to **Environment** section
2. Add these variables (copy from your `.env`):

```
PORT=5050
NODE_ENV=production
SESSION_SECRET=<generate-strong-secret-here>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
BASE_URL=https://typewritepro-<hash>.onrender.com
GOOGLE_REDIRECT_URI=https://typewritepro-<hash>.onrender.com/auth/google/callback
```

**Important Notes:**
- Replace `<hash>` with actual Render subdomain (shown after first deploy)
- Generate a strong `SESSION_SECRET` (minimum 32 characters):
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 2.5 Deploy

1. Click **Deploy**
2. Monitor deployment in **Logs** tab
3. Wait for "Deploying..." → "Live"
4. You'll see URL: `https://typewritepro-<hash>.onrender.com`

---

## ⚙️ Step 3: Configure Google OAuth for Render

After getting your Render deployment URL:

### 3.1 Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your OAuth 2.0 Client ID
3. Edit **Authorized redirect URIs**:
   - Remove: `http://localhost:5050/auth/google/callback`
   - Add: `https://typewritepro-<hash>.onrender.com/auth/google/callback`
4. Save changes

### 3.2 Update Render Environment Variables

1. Go back to Render dashboard
2. Go to **Environment** section
3. Update:
   - `BASE_URL=https://typewritepro-<hash>.onrender.com`
   - `GOOGLE_REDIRECT_URI=https://typewritepro-<hash>.onrender.com/auth/google/callback`
4. Click **Save**
5. Render will auto-redeploy

---

## 🔍 Testing After Deployment

### Test Core Features

```
1. Editor
   - [ ] Type text in editor
   - [ ] See live preview
   - [ ] RTL/LTR auto-detection works

2. Markdown Tools
   - [ ] Tools → Markdown Tools → Heading works
   - [ ] Try other tools (Footer, Box, etc.)

3. Export
   - [ ] File → Export → Markdown works
   - [ ] File → Export → HTML works
   - [ ] File → Export → PDF works

4. Google Drive (if configured)
   - [ ] File → Export → Connect to Google Drive
   - [ ] Login and save document
```

### Monitor Logs

```bash
# View Render logs (in Render dashboard)
# Check for errors related to:
# - Server startup
# - OAuth errors
# - Database connection
```

---

## 🆘 Troubleshooting Deployment

### Build Fails

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
# Locally, ensure dependencies resolve
npm ci
npm run build

# If it works locally but fails on Render,
# add NODE_OPTIONS to Render environment:
NODE_OPTIONS=--legacy-peer-deps
```

### OAuth Not Working on Render

**Error:** `redirect_uri_mismatch`

**Solution:**
1. Verify Render URL matches Google Console exactly
2. No `http://` only `https://` for production
3. Wait 1-2 minutes for Google to cache changes
4. Clear browser cookies and try again

### Port Issues

**Error:** `EADDRINUSE` or port not accessible

**Render automatically sets PORT environment variable**
- Don't hardcode port
- Your `server/app.ts` reads: `const port = parseInt(process.env.PORT || '5050', 10);`
- This is already correct ✅

### Blank Page on Load

**Solution:**
1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests
4. View Render logs for server errors

---

## 📊 Monitoring & Maintenance

### View Logs

**Render Dashboard:**
- Logs tab shows real-time server output
- Filter by date/time
- Search for error keywords

### Update Code

**To update deployed code:**

```bash
# Make changes locally
git add .
git commit -m "fix: update feature"
git push origin main

# Render auto-detects and auto-redeploys!
# Monitor in Logs tab
```

### Custom Domain (Optional)

1. Render Dashboard → **Settings**
2. **Custom Domain**
3. Add your domain (e.g., `typewriterpro.com`)
4. Update DNS records (instructions provided)

---

## 📝 Important Files Checklist

Before GitHub push, verify these files exist:

```
TypeWriterPro/
├── README.md                 ✅ Main documentation
├── CONTRIBUTING.md           ✅ Contribution guidelines  
├── LICENSE                   ✅ License with proprietary notice
├── PROPRIETARY_LICENSE       ✅ Detailed proprietary terms
├── .env.example              ✅ Template for environment
├── .gitignore                ✅ Updated with all sensitivities
├── design_guidelines.md      ✅ For developers
├── replit.md                 ✅ Architecture reference
├── package.json              ✅ Dependencies
├── .github/
│   └── copilot-instructions.md ✅ Development guidance
└── ... (source code)
```

---

## 🎉 Success!

Once deployed on Render:

- ✅ Application is live on `https://typewritepro-<hash>.onrender.com`
- ✅ Auto-deploys on `git push` to main
- ✅ Google Drive integration works (if configured)
- ✅ Logs are monitored via Render dashboard
- ✅ You can share the public URL with anyone

---

## 📞 Support

If you encounter issues:

1. **Check Render Logs** - Most issues are visible there
2. **Verify Environment Variables** - Ensure all are set correctly
3. **Test Locally** - Run `npm run dev` to verify locally first
4. **Google OAuth** - Double-check redirect URI in Google Cloud Console
5. **GitHub Issues** - Open an issue in repository

---

## 🔒 Security Reminders

- ❌ **Never** commit `.env` file
- ❌ **Never** share `GOOGLE_CLIENT_SECRET`
- ✅ **Always** use `SESSION_SECRET` in production
- ✅ **Always** use `https://` for production URLs
- ✅ **Always** verify redirect URIs match exactly

---

**Your TypeWriterPro is now live! 🚀**

*Last Updated: December 2024*
