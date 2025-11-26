# TypeWriterPro - Professional Markdown Editor

## Overview

TypeWriterPro is a cross-platform professional Markdown editor built with React and Express. The application provides a sophisticated writing environment with intelligent RTL/LTR auto-detection for Farsi and English content, live preview rendering, and multiple export formats. It features a Monaco Editor integration (VS Code's editor) for a premium editing experience, along with a comprehensive theming system and document management capabilities.

The application is designed for writers who work with multilingual content, particularly those who write in both Farsi (Persian) and English, requiring seamless direction switching without manual intervention.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- Single-page application (SPA) architecture

**State Management**
- Zustand with persistence middleware for global application state
- TanStack React Query for server state management and caching
- Local state stored in browser's localStorage for settings persistence

**UI Component System**
- shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Custom theme system supporting light and dark modes
- Design inspired by VS Code (editor), Notion (document experience), and Typora (Markdown focus)

**Editor Integration**
- Monaco Editor (VS Code's editor) via @monaco-editor/react
- Custom themes defined for light and dark modes
- Markdown syntax highlighting with custom token rules
- Auto-direction detection for RTL/LTR content

**Layout System**
- Resizable split-pane layout using react-resizable-panels
- Flexible editor/preview split (default 50/50, adjustable 30/70 to 70/30)
- Collapsible sidebar for document outline (280px fixed width)
- Settings panel as right-side sheet overlay (400px width)

**Direction Detection & Rendering**
- Custom direction detection algorithm analyzing Unicode character ranges
- RTL detection for Persian/Arabic scripts (U+0591-U+07FF, U+FB1D-U+FDFD, U+FE70-U+FEFC)
- LTR detection for Latin characters
- Per-paragraph direction application in preview
- Real-time direction feedback in status bar

**Markdown Processing**
- Marked.js for Markdown-to-HTML conversion
- GitHub Flavored Markdown (GFM) support
- Custom HTML post-processing for direction attributes
- Dynamic styling for blockquotes, lists, and headings based on text direction

**Export Capabilities**
- PDF export using html2canvas and jsPDF
- HTML export with embedded styles
- Markdown export (raw content)
- Export functionality integrated into MenuBar component

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Dual-mode server configuration (development and production)
- Custom logging middleware for API requests

**Development vs Production**
- Development: Vite middleware integration with HMR support
- Production: Static file serving from pre-built dist directory
- Environment-based configuration using NODE_ENV

**API Design**
- RESTful API endpoints under `/api` namespace
- JSON request/response format
- Error handling with appropriate HTTP status codes

**Storage Layer**
- Abstracted storage interface (`IStorage`) for flexibility
- In-memory storage implementation (`MemStorage`) as default
- Prepared for database migration with schema-first approach
- Document model includes: id, title, content, createdAt, updatedAt

**API Endpoints**
- `GET /api/documents` - List all documents (sorted by updatedAt descending)
- `GET /api/documents/:id` - Retrieve specific document
- `POST /api/documents` - Create new document
- `PATCH /api/documents/:id` - Update existing document
- `DELETE /api/documents/:id` - Delete document

### Data Management

**Schema Validation**
- Zod for runtime type validation
- Schema definitions in shared directory for client/server consistency
- Type inference from Zod schemas for TypeScript types

**Document Schema**
```typescript
{
  id: string
  title: string
  content: string
  createdAt: string (ISO date)
  updatedAt: string (ISO date)
}
```

**Editor Settings Schema**
- Font family, size, and line height
- Word wrap and auto-direction toggles
- Line numbers and minimap visibility
- Tab size configuration
- All settings with default values and validation ranges

**Application State**
- Current document reference
- Theme preference (light/dark)
- Editor settings
- UI panel visibility flags (sidebar, preview, settings, table builder)
- Real-time metrics (headings, cursor position, word/character counts)
- Document modification status

### Database Preparation

**Drizzle ORM Configuration**
- Configured for PostgreSQL dialect
- Schema location: `./shared/schema.ts`
- Migrations output: `./migrations` directory
- Connection via DATABASE_URL environment variable
- Currently using in-memory storage but ready for database migration

**Note on Database**
The application is configured with Drizzle ORM and PostgreSQL schema but currently uses in-memory storage. The schema structure in `shared/schema.ts` defines the data models, and the storage interface in `server/storage.ts` provides an abstraction layer allowing easy migration to database-backed storage without modifying API routes.

### Typography & Internationalization

**Font Strategy**
- English/Code: Inter (UI), JetBrains Mono (editor)
- Farsi/RTL: Vazirmatn for all Persian text
- Fallback: system-ui, sans-serif
- Fonts loaded via Google Fonts with preconnect optimization

**Direction Handling**
- Automatic detection at paragraph level
- Separate detection for editor and preview
- Mixed-content support with character-ratio analysis
- Visual indicators in status bar

## External Dependencies

### UI & Styling
- **Radix UI**: Comprehensive set of accessible, unstyled component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: For component variant management
- **tailwind-merge**: Intelligent Tailwind class merging

### Editor & Markdown
- **Monaco Editor** (@monaco-editor/react): VS Code's editor component
- **marked**: Fast Markdown parser and compiler
- **html2canvas**: HTML to canvas conversion for PDF export
- **jsPDF**: PDF generation library

### State Management & Data Fetching
- **Zustand**: Lightweight state management with persistence
- **TanStack React Query**: Server state management and caching
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation resolver for React Hook Form

### Routing & Utilities
- **wouter**: Minimalist routing library
- **date-fns**: Modern date utility library
- **nanoid**: Unique ID generation
- **clsx**: Conditional class name utility

### Database & Validation
- **Drizzle ORM** (drizzle-orm, drizzle-kit): TypeScript ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **Zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle and Zod

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Session & Middleware
- **connect-pg-simple**: PostgreSQL session store for Express
- **express-session** (implied): Session middleware for Express

### Design System References
The UI design draws inspiration from:
- **VS Code**: Editor interface patterns
- **Notion**: Document experience and interaction patterns
- **Typora**: Markdown-focused writing environment