# TypeWriterPro - Professional Markdown Editor

<div align="center">

![TypeWriterPro](https://img.shields.io/badge/TypeWriterPro-Professional%20Markdown%20Editor-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-LTS-green?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

**A sophisticated cross-platform Markdown editor with intelligent RTL/LTR auto-detection, live preview, and professional export capabilities.**

</div>

---

## 🌟 Features

### Core Editing
- **Monaco Editor Integration** - Professional code editor (VS Code's engine) with syntax highlighting
- **Live Markdown Preview** - Real-time rendering as you type
- **RTL/LTR Auto-Detection** - Seamless Farsi/English support with automatic direction switching
- **Per-Paragraph Direction** - Each paragraph maintains its own optimal text direction
- **Rich Markdown Support** - Full GitHub-flavored Markdown (GFM) support

### Markdown Tools
- **6 Built-in Dialogs**:
  - Heading Generator (H1-H6)
  - Header Template (title, subject, date)
  - Footer with page numbers
  - Styled Box/Container
  - Border Wrapper
  - Code Block with 20+ language support
  - Table Builder
  - Paragraph Styler (multiple fonts and styles)

### Export & Storage
- **Multiple Export Formats**:
  - Markdown (.md)
  - HTML (.html) - with embedded fonts and styles
  - PDF (.pdf) - high-quality document generation
- **Google Drive Integration** - Direct save to your Google Drive account
- **Local Storage** - Auto-save and persistent document management

### UI/UX
- **Dark/Light Themes** - Full theme support with system detection
- **Resizable Panels** - Adjust editor/preview ratio (30/70 to 70/30)
- **Collapsible Sidebar** - Document outline and navigation
- **Settings Panel** - Customizable editor behavior and appearance
- **Responsive Design** - Works on desktop with optimal layout

### Typography
- **Farsi Fonts**: Nazanin, Vazirmatn, IRANSans
- **English Fonts**: Inter, JetBrains Mono
- **Custom Styling**: Font size, color, line-height, letter-spacing
- **Professional Output** - Publication-ready documents

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/TypeWriterPro.git
cd TypeWriterPro

# Install dependencies
npm install

# Create .env file with configuration
cp .env.example .env
```

### Configuration

**Google Drive Integration** (Optional)

To enable Google Drive save functionality:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new OAuth 2.0 Client ID (Application type: Web application)
3. Add Authorized redirect URI: `http://localhost:5050/auth/google/callback`
4. Copy your Client ID and Secret to `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
BASE_URL=http://localhost:5050
GOOGLE_REDIRECT_URI=http://localhost:5050/auth/google/callback
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The application will be available at `http://localhost:5050`

### Production Build

```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

The built application will be served on port 5050.

---

## 📁 Project Structure

```
TypeWriterPro/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── editor/             # Editor components
│   │   │   │   ├── MonacoEditor.tsx
│   │   │   │   ├── MarkdownPreview.tsx
│   │   │   │   ├── MenuBar.tsx
│   │   │   │   └── dialogs/        # Markdown tools dialogs
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── markdown.ts         # Markdown rendering
│   │   │   ├── markdown-blocks.ts  # Block generators
│   │   │   ├── export.ts           # Export functionality
│   │   │   ├── store.ts            # Zustand state
│   │   │   └── direction.ts        # RTL/LTR detection
│   │   └── main.tsx
│   └── index.html
├── server/                          # Express backend
│   ├── app.ts                      # Express setup
│   ├── routes.ts                   # API routes + OAuth
│   ├── storage.ts                  # Document storage
│   ├── index-dev.ts                # Development entry
│   └── index-prod.ts               # Production entry
├── shared/                          # Shared types
│   └── schema.ts                   # Validation schemas
├── .env                            # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Monaco Editor** - Code editor (VS Code)
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **marked** - Markdown parsing

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime
- **TypeScript** - Type safety
- **jsPDF + html2canvas** - PDF generation
- **Google OAuth 2.0** - Drive integration

### Build & Deployment
- **Vite** - Frontend bundling
- **esbuild** - Backend bundling
- **Tailwind CSS** - Utility-first CSS

---

## 📖 Usage Guide

### Creating a New Document
1. Click **File → New** or press `Ctrl+N`
2. Start typing in the editor on the left
3. See live preview on the right

### Applying Markdown Tools
1. Go to **Tools → Markdown Tools**
2. Choose your desired tool:
   - **Heading** - Create titles
   - **Header** - Add page header with title/subject/date
   - **Footer** - Add footer with optional page numbers
   - **Box** - Create styled containers
   - **Border** - Add bordered wrappers
   - **Table** - Generate tables with custom styling
   - **Code** - Insert code blocks with syntax highlighting
   - **Paragraph** - Apply advanced text styling

### Exporting Your Work
1. Go to **File → Export**
2. Choose format:
   - **Export as Markdown** - Plain text format
   - **Export as HTML** - Web-ready format
   - **Export as PDF** - Print-ready format

### Saving to Google Drive
1. Click **File → Export → Connect to Google Drive**
2. Sign in with your Google account
3. Choose save format:
   - **Save MD to Drive** - Markdown format
   - **Save HTML to Drive** - HTML format

### Customizing Editor
1. Click the **⚙️ Settings** icon (top-right)
2. Adjust:
   - Font size (12-32px)
   - Theme (Light/Dark)
   - Auto-direction detection
   - Preview position
   - Sidebar visibility

---

## 🎨 Customization

### Adding Custom Themes
Edit `client/src/lib/store.ts` to add new theme definitions in the `useEditorStore`.

### Modifying Markdown Rendering
Update `client/src/lib/markdown.ts` to customize how Markdown is rendered.

### Adding Markdown Dialogs
1. Create a new dialog component in `client/src/components/editor/dialogs/`
2. Add corresponding generator in `client/src/lib/markdown-blocks.ts`
3. Import and add to `client/src/components/editor/MenuBar.tsx`

---

## 📱 Supported Languages

### For Writing
- **English (LTR)** - Full support
- **Farsi/Persian (RTL)** - Full support with auto-detection
- **Mixed Content** - Automatic per-paragraph direction

### Code Highlighting (20+ languages)
JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Dart, Scala, R, MATLAB, SQL, HTML, CSS, JSON, XML, YAML, Markdown, Bash, and more.

---

## ⚙️ Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push database schema (if using Drizzle ORM) |

---

## 🔐 Privacy & Data Storage

- **Documents** are stored locally in browser's localStorage
- **No cloud sync** by default (optional Google Drive integration)
- **No tracking** or analytics
- **No ads** or third-party scripts

---

## 🐛 Troubleshooting

### OAuth Redirect URI Mismatch
**Problem**: "Error 400: redirect_uri_mismatch" when connecting Google Drive

**Solution**:
1. Verify `.env` has correct `BASE_URL` and `GOOGLE_REDIRECT_URI`
2. In Google Cloud Console → OAuth client → check "Authorized redirect URIs"
3. Ensure it matches: `http://localhost:5050/auth/google/callback`
4. Restart dev server: `npm run dev`

### Fonts Not Displaying
**Problem**: Farsi fonts showing as boxes or default system font

**Solution**:
1. Ensure `index.html` has font imports (Google Fonts + Iran Sans CDN)
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Restart dev server

### Preview Not Syncing
**Problem**: Editor and preview scroll/cursor position not syncing

**Solution**:
1. Make sure store state is properly initialized
2. Check browser console for errors: `F12 → Console`
3. Restart application

---

## 📝 License

This project is **Proprietary Software**. All rights reserved.

```
Copyright © 2024 TypeWriterPro. All rights reserved.

Unauthorized copying, modification, or distribution of this software 
is prohibited without explicit written permission from the owner.

For licensing inquiries, contact: [your-email@example.com]
```

### What This Means
- ✅ You can use this software if you have proper license
- ✅ You can fork and modify for personal/internal use (with license)
- ❌ Cannot redistribute without permission
- ❌ Cannot claim ownership or authorship
- ❌ Cannot remove copyright/license notice

---

## 🤝 Contributing

This is a proprietary project. Contributions are welcome from authorized team members only.

For contribution guidelines and setup:
1. Request access from project maintainer
2. Follow code style in `design_guidelines.md`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Commit changes: `git commit -m "feat: add your feature"`
5. Push to branch: `git push origin feature/your-feature`
6. Create Pull Request with detailed description

---

## 📞 Support & Contact

- **GitHub Issues** - For bug reports
- **Email** - [parssstore.ir@gmail.com]
- **Documentation** - See `design_guidelines.md` for architecture details

---

## 🙏 Acknowledgments

- **Monaco Editor** - VS Code's powerful editor engine
- **React & TypeScript** - Modern web development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Google Fonts & Iran Sans** - Typography support

---

## 📊 Project Status

- ✅ **Core Editing** - Production ready
- ✅ **Markdown Tools** - Feature complete
- ✅ **Export (MD/HTML/PDF)** - Production ready
- ✅ **RTL/LTR Support** - Fully optimized
- ✅ **Google Drive Integration** - Working (OAuth setup required)
- 🔄 **Database Integration** - In development
- 📋 **Mobile Responsive** - Planned for future releases

---

**Built with ❤️ for writers who speak multiple languages.**

*Last Updated: December 2024*
