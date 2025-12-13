import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Document, EditorSettings, Theme, Heading } from "@shared/schema";
import { defaultSettings } from "@shared/schema";

interface EditorState {
  currentDocument: Document | null;
  defaultDocument: Document;
  content: string;
  theme: Theme;
  settings: EditorSettings;
  showSidebar: boolean;
  showPreview: boolean;
  previewMode: "split" | "preview-full" | "editor-full";
  pageSettings: {
    backgroundColor: string;
    backgroundImage?: string;
    fontFamily: string;
    fontSize: number;
    padding: number;
    lineSpacing: number;
    borderStyle: "none" | "single" | "double";
    borderColor: string;
    borderWidth: number;
    headerLine: boolean;
  };
  defaultDocumentPageSettings: {
    backgroundColor: string;
    backgroundImage?: string;
    fontFamily: string;
    fontSize: number;
    padding: number;
    borderStyle: "none" | "single" | "double";
    borderColor: string;
    borderWidth: number;
    headerLine: boolean;
  };
  workspaces: Array<{
    id: string;
    name: string;
    pageSettings: EditorState["pageSettings"];
    pages: Document[];
  }>;
  currentWorkspaceId: string | null;
  showSettings: boolean;
  showTableBuilder: boolean;
  headings: Heading[];
  cursorPosition: { line: number; column: number };
  scrollPosition: { editor: number; preview: number };
  wordCount: number;
  charCount: number;
  detectedDirection: "ltr" | "rtl" | "mixed";
  isModified: boolean;
  
  setContent: (content: string) => void;
  setTheme: (theme: Theme) => void;
  setSettings: (settings: Partial<EditorSettings>) => void;
  toggleSidebar: () => void;
  togglePreview: () => void;
  toggleSettings: () => void;
  toggleTableBuilder: () => void;
  setHeadings: (headings: Heading[]) => void;
  setCursorPosition: (line: number, column: number) => void;
  setScrollPosition: (position: "editor" | "preview", value: number) => void;
  setPreviewMode: (mode: "split" | "preview-full" | "editor-full") => void;
  setPageSettings: (settings: Partial<EditorState["pageSettings"]>) => void;
  createWorkspace: (name: string) => string;
  deleteWorkspace: (id: string) => boolean;
  setCurrentWorkspace: (id: string | null) => void;
  createPageInCurrentWorkspace: (title?: string, savePath?: string) => Document | null;
  deletePageFromWorkspace: (workspaceId: string, pageId: string) => boolean;
  setWorkspacePageSettings: (workspaceId: string, settings: Partial<EditorState["pageSettings"]>) => void;
  setWordCount: (count: number) => void;
  setCharCount: (count: number) => void;
  setDetectedDirection: (direction: "ltr" | "rtl" | "mixed") => void;
  newDocument: () => void;
  openDocument: (doc: Document) => void;
  saveDocument: () => Document | null;
  setIsModified: (modified: boolean) => void;
  setDefaultDocumentPageSettings: (settings: Partial<EditorState["defaultDocumentPageSettings"]>) => void;
  switchToDefaultDocument: () => void;
}

const sampleMarkdown = `# Welcome to TypeWriterPro

A professional Markdown editor with intelligent RTL/LTR support.

## Features

- **Monaco Editor**: VS Code-quality editing experience
- **Live Preview**: See your formatted content in real-time
- **RTL/LTR Auto-Detection**: Seamlessly write in Farsi and English
- **Theme Support**: Light and Dark modes
- **Export Options**: PDF, HTML, and Markdown

## نوشتن به فارسی

این ویرایشگر به صورت خودکار متن فارسی را تشخیص داده و جهت آن را از راست به چپ تنظیم می‌کند.

### Mixed Content

You can write in both English and فارسی in the same document. The editor will automatically detect the direction of each paragraph.

## Code Examples

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Tables

| Feature | Status |
|---------|--------|
| Editor | ✓ |
| Preview | ✓ |
| Export | ✓ |

## Get Started

Start typing in the editor on the left, and see the preview update in real-time on the right!
`;

const defaultPageSettings = {
  backgroundColor: "#ffffff",
  backgroundImage: undefined,
  fontFamily: "Inter",
  fontSize: 16,
  lineSpacing: 1.7,
  padding: 32,
  borderStyle: "none" as const,
  borderColor: "#e5e7eb",
  borderWidth: 1,
  headerLine: true,
};

const defaultDocumentInit: Document = {
  id: "default-document",
  title: "TypeWriterPro",
  content: sampleMarkdown,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      currentDocument: defaultDocumentInit,
      defaultDocument: defaultDocumentInit,
      content: sampleMarkdown,
      theme: "light",
      settings: defaultSettings,
      showSidebar: true,
      showPreview: true,
      previewMode: "split",
      pageSettings: { ...defaultPageSettings },
      defaultDocumentPageSettings: { ...defaultPageSettings },
      // No user-created workspaces by default. The app starts with a global/default document/page.
      workspaces: [],
      currentWorkspaceId: null,
      showSettings: false,
      showTableBuilder: false,
      headings: [],
      cursorPosition: { line: 1, column: 1 },
      scrollPosition: { editor: 0, preview: 0 },
      wordCount: 0,
      charCount: 0,
      detectedDirection: "ltr",
      isModified: false,
      
      setContent: (content) => set({ content, isModified: true }),
      
      setTheme: (theme) => {
        set({ theme });
        // Clear existing theme classes
        const classes = ["dark", "theme-ocean", "theme-sepia", "theme-aurora", "theme-dark-blue", "theme-midnight", "theme-deep-blue", "theme-plum"];
        classes.forEach((c) => document.documentElement.classList.remove(c));
        // Apply new theme class if needed
        if (theme === "dark") document.documentElement.classList.add("dark");
        if (theme === "ocean") document.documentElement.classList.add("theme-ocean");
        if (theme === "sepia") document.documentElement.classList.add("theme-sepia");
        if (theme === "aurora") document.documentElement.classList.add("theme-aurora");
        if (theme === "dark-blue") document.documentElement.classList.add("theme-dark-blue");
        if (theme === "midnight") document.documentElement.classList.add("theme-midnight");
        if (theme === "deep-blue") document.documentElement.classList.add("theme-deep-blue");
        if (theme === "plum") document.documentElement.classList.add("theme-plum");
      },
      
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
      togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
      toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
      toggleTableBuilder: () => set((state) => ({ showTableBuilder: !state.showTableBuilder })),
      
      setHeadings: (headings) => set({ headings }),
      setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),
      setScrollPosition: (position, value) =>
        set((state) => ({
          scrollPosition: { ...state.scrollPosition, [position]: value },
        })),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setPageSettings: (newSettings) =>
        set((state) => {
          const updated = { ...state.pageSettings, ...newSettings };
          // If currently in default document, also update default document settings
          const isDefaultDoc = state.currentDocument?.id === state.defaultDocument.id;
          return {
            pageSettings: updated,
            ...(isDefaultDoc ? { defaultDocumentPageSettings: updated } : {}),
          };
        }),
      createWorkspace: (name) => {
        const id = crypto.randomUUID?.() || String(Date.now());
        const ws = {
          id,
          name: name || `Workspace ${id}`,
          pageSettings: { ...get().pageSettings },
          pages: [] as Document[],
        };
        set((state) => ({ workspaces: [...state.workspaces, ws], currentWorkspaceId: id }));
        return id;
      },
        deleteWorkspace: (id) => {
          const state = get();
          const exists = state.workspaces.some((w) => w.id === id);
          if (!exists) return false;
          const newWorkspaces = state.workspaces.filter((w) => w.id !== id);
          const newCurrent = state.currentWorkspaceId === id ? (newWorkspaces[0]?.id || null) : state.currentWorkspaceId;
          set({ workspaces: newWorkspaces, currentWorkspaceId: newCurrent });
          return true;
        },
      setCurrentWorkspace: (id) => set(() => ({ currentWorkspaceId: id })),
      createPageInCurrentWorkspace: (title, savePath) => {
        const state = get();
        const wsId = state.currentWorkspaceId;
        if (!wsId) return null;
        const wsIndex = state.workspaces.findIndex((w) => w.id === wsId);
        if (wsIndex === -1) return null;
        const now = new Date().toISOString();
        const doc: Document = {
          id: crypto.randomUUID?.() || String(Date.now()),
          title: title || "Untitled Page",
          content: "",
          savePath: savePath,
          createdAt: now,
          updatedAt: now,
        };
        const newWorkspaces = [...state.workspaces];
        newWorkspaces[wsIndex] = { ...newWorkspaces[wsIndex], pages: [...newWorkspaces[wsIndex].pages, doc] };
        set({ workspaces: newWorkspaces });
        return doc;
      },
      deletePageFromWorkspace: (workspaceId, pageId) => {
        const state = get();
        const wsIndex = state.workspaces.findIndex((w) => w.id === workspaceId);
        if (wsIndex === -1) return false;
        const ws = state.workspaces[wsIndex];
        const exists = ws.pages.some((p) => p.id === pageId);
        if (!exists) return false;
        const newPages = ws.pages.filter((p) => p.id !== pageId);
        const newWorkspaces = [...state.workspaces];
        newWorkspaces[wsIndex] = { ...ws, pages: newPages };
        // If the deleted page is currently open, switch back to default document
        const isCurrent = state.currentDocument?.id === pageId;
        set({ workspaces: newWorkspaces, currentWorkspaceId: state.currentWorkspaceId === workspaceId && newPages.length === 0 ? null : state.currentWorkspaceId });
        if (isCurrent) {
          // switch to default document
          set({ currentDocument: state.defaultDocument, content: state.defaultDocument.content, currentWorkspaceId: null, pageSettings: { ...state.defaultDocumentPageSettings } });
        }
        return true;
      },
      setWorkspacePageSettings: (workspaceId, newSettings) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, pageSettings: { ...w.pageSettings, ...newSettings } } : w
          ),
        }));
      },
      setWordCount: (count) => set({ wordCount: count }),
      setCharCount: (count) => set({ charCount: count }),
      setDetectedDirection: (direction) => set({ detectedDirection: direction }),
      
      newDocument: () => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const doc: Document = {
          id,
          title: "Untitled Document",
          content: "",
          createdAt: now,
          updatedAt: now,
        };
        set({ currentDocument: doc, content: "", isModified: false });
      },
      
      openDocument: (doc) => {
        // When opening a document, apply its specific page settings (from workspace or default)
        const state = get();
        const ws = state.workspaces.find((w) => w.pages.some((p) => p.id === doc.id));
        if (ws) {
          // Document belongs to a workspace: apply workspace's page settings
          set({ currentDocument: doc, content: doc.content, isModified: false, currentWorkspaceId: ws.id, pageSettings: { ...ws.pageSettings } });
        } else if (doc.id === state.defaultDocument.id) {
          // Opening the default document: apply default page settings
          set({ currentDocument: doc, content: doc.content, isModified: false, currentWorkspaceId: null, pageSettings: { ...state.defaultDocumentPageSettings } });
        } else {
          // Unknown document: just load it without changing page settings
          set({ currentDocument: doc, content: doc.content, isModified: false, currentWorkspaceId: null });
        }
      },
      
      saveDocument: () => {
        const state = get();
        const now = new Date().toISOString();
        
        if (state.currentDocument) {
          const updated: Document = {
            ...state.currentDocument,
            content: state.content,
            updatedAt: now,
          };
          set({ currentDocument: updated, isModified: false });
          return updated;
        }
        
        const id = crypto.randomUUID();
        const newDoc: Document = {
          id,
          title: "Untitled Document",
          content: state.content,
          createdAt: now,
          updatedAt: now,
        };
        set({ currentDocument: newDoc, isModified: false });
        return newDoc;
      },
      
      setIsModified: (modified) => set({ isModified: modified }),
      
      setDefaultDocumentPageSettings: (newSettings) =>
        set((state) => ({
          defaultDocumentPageSettings: { ...state.defaultDocumentPageSettings, ...newSettings },
          // If currently viewing the default document, also update the active pageSettings
          ...(state.currentDocument?.id === state.defaultDocument.id ? { pageSettings: { ...state.pageSettings, ...newSettings } } : {}),
        })),
      
      switchToDefaultDocument: () => {
        const state = get();
        set({
          currentDocument: state.defaultDocument,
          content: state.defaultDocument.content,
          currentWorkspaceId: null,
          pageSettings: { ...state.defaultDocumentPageSettings },
          isModified: false,
        });
      },
    }),
    {
      name: "typewriterpro-storage",
      partialize: (state) => ({
        theme: state.theme,
        settings: state.settings,
        showSidebar: state.showSidebar,
        showPreview: state.showPreview,
        content: state.content,
        defaultDocument: state.defaultDocument,
        defaultDocumentPageSettings: state.defaultDocumentPageSettings,
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
);
