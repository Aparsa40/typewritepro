import { useCallback, useState, useEffect } from "react";
import {
  File,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  FileText,
  FileCode,
  Cloud,
  Undo2,
  Redo2,
  Search,
  Replace,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Table2,
  List,
  Settings,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { renderMarkdown } from "@/lib/markdown";
import { exportToMarkdown, exportToHTML, exportToPDF } from "@/lib/export";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { HeadingDialog } from "./dialogs/HeadingDialog";
import { FooterDialog } from "./dialogs/FooterDialog";
import { BoxDialog } from "./dialogs/BoxDialog";
import { TableDialog } from "./dialogs/TableDialog";
import { CodeDialog } from "./dialogs/CodeDialog";
import { ParagraphDialog } from "./dialogs/ParagraphDialog";
import { HeaderTemplateDialog } from "./dialogs/HeaderTemplateDialog";
import { BorderDialog } from "./dialogs/BorderDialog";

export function MenuBar() {
  const {
    content,
    theme,
    setTheme,
    showSidebar,
    showPreview,
    toggleSidebar,
    togglePreview,
    toggleSettings,
    toggleTableBuilder,
    newDocument,
    saveDocument,
  } = useEditorStore();

  const { toast } = useToast();

  const handleNew = useCallback(() => {
    newDocument();
    toast({
      title: "New Document",
      description: "Created a new blank document.",
    });
  }, [newDocument, toast]);

  const handleOpen = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.txt,.markdown";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        useEditorStore.getState().setContent(text);
        toast({
          title: "File Opened",
          description: `Loaded: ${file.name}`,
        });
      }
    };
    input.click();
  }, [toast]);

  const handleSave = useCallback(() => {
    saveDocument();
    toast({
      title: "Document Saved",
      description: "Your changes have been saved locally.",
    });
  }, [saveDocument, toast]);

  const handleSaveAs = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "File Downloaded",
      description: "Markdown file has been downloaded.",
    });
  }, [content, toast]);

  const handleExportMarkdown = useCallback(() => {
    try {
      exportToMarkdown(content, "document.md");
      toast({
        title: "Export Complete",
        description: "Markdown file exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export Markdown file.",
        variant: "destructive",
      });
    }
  }, [content, toast]);

  const handleExportHTML = useCallback(() => {
    try {
      const html = renderMarkdown(content, true);
      exportToHTML(content, html, "document.html", {
        title: "TypeWriterPro Document",
        date: new Date(),
      });
      toast({
        title: "Export Complete",
        description: "HTML file exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export HTML file.",
        variant: "destructive",
      });
    }
  }, [content, toast]);

  const handleExportPDF = useCallback(async () => {
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your PDF...",
    });

    try {
      const html = renderMarkdown(content, true);
      await exportToPDF(html, "document.pdf", {
        title: "TypeWriterPro Document",
        date: new Date(),
      });
      toast({
        title: "Export Complete",
        description: "PDF file exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [content, toast]);

  const handleUndo = useCallback(() => {
    document.execCommand("undo");
  }, []);

  const handleRedo = useCallback(() => {
    document.execCommand("redo");
  }, []);

  const handleSearch = useCallback(() => {
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    if (editor) {
      editor.getAction("actions.find")?.run();
    }
  }, []);

  const handleReplace = useCallback(() => {
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    if (editor) {
      editor.getAction("editor.action.startFindReplaceAction")?.run();
    }
  }, []);

  // Google Drive integration (client side)
  const [driveTokenId, setDriveTokenId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('driveTokenId');
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      // Expect { tokenId }
      if (e?.data && typeof e.data === 'object' && e.data.tokenId) {
        setDriveTokenId(e.data.tokenId);
        try { localStorage.setItem('driveTokenId', e.data.tokenId); } catch {}
        toast({ title: 'Drive Connected', description: 'Connected to Google Drive.' });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [toast]);

  const connectToDrive = useCallback(() => {
    const popup = window.open('/auth/google', 'google-drive-auth', 'width=600,height=700');
    if (!popup) {
      toast({ title: 'Popup Blocked', description: 'Please allow popups for this site.', variant: 'destructive' });
    }
  }, [toast]);

  const saveToDrive = useCallback(async (format: 'html' | 'md' | 'pdf') => {
    if (!driveTokenId) {
      toast({ title: 'Not connected', description: 'Please connect to Google Drive first.', variant: 'destructive' });
      return;
    }

    try {
      let name = 'document';
      let mimeType = 'text/plain';
      let contentToUpload = '';

      if (format === 'md') {
        name = 'document.md';
        mimeType = 'text/markdown';
        contentToUpload = content;
      } else if (format === 'html') {
        name = 'document.html';
        mimeType = 'text/html';
        contentToUpload = renderMarkdown(content, true);
      } else {
        // pdf: generate as Blob via exportToPDF flow but exportToPDF returns file via save
        // Instead, create HTML and upload as pdf by asking server to convert is complex; fallback: upload HTML with .pdf name (not perfect)
        name = 'document.pdf';
        mimeType = 'application/pdf';
        contentToUpload = renderMarkdown(content, true);
      }

      const resp = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: driveTokenId, name, mimeType, content: contentToUpload }),
      });
      const json = await resp.json();
      if (!resp.ok) throw json;
      toast({ title: 'Saved to Drive', description: `Saved ${name} to your Drive.` });
    } catch (err) {
      console.error('Save to Drive error', err);
      toast({ title: 'Upload failed', description: 'Failed to upload to Drive.', variant: 'destructive' });
    }
  }, [driveTokenId, content, renderMarkdown, toast]);

  return (
    <header className="h-12 border-b bg-background flex items-center justify-between px-2 gap-1 flex-shrink-0" data-testid="menu-bar">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2 px-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm hidden sm:inline">TypeWriterPro</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="menu-file">
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={handleNew} data-testid="menu-file-new">
              <FilePlus className="mr-2 h-4 w-4" />
              New
              <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpen} data-testid="menu-file-open">
              <FolderOpen className="mr-2 h-4 w-4" />
              Open
              <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSave} data-testid="menu-file-save">
              <Save className="mr-2 h-4 w-4" />
              Save
              <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveAs} data-testid="menu-file-save-as">
              <Download className="mr-2 h-4 w-4" />
              Save As
              <DropdownMenuShortcut>Ctrl+Shift+S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={handleExportMarkdown} data-testid="menu-export-md">
                  <FileText className="mr-2 h-4 w-4" />
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHTML} data-testid="menu-export-html">
                  <FileCode className="mr-2 h-4 w-4" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} data-testid="menu-export-pdf">
                  <File className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={connectToDrive} data-testid="menu-drive-connect">
                  <Cloud className="mr-2 h-4 w-4" />
                  Connect to Google Drive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => saveToDrive('md')} data-testid="menu-drive-save-md">
                  <FileText className="mr-2 h-4 w-4" />
                  Save MD to Drive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => saveToDrive('html')} data-testid="menu-drive-save-html">
                  <FileCode className="mr-2 h-4 w-4" />
                  Save HTML to Drive
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="menu-edit">
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={handleUndo} data-testid="menu-edit-undo">
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
              <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRedo} data-testid="menu-edit-redo">
              <Redo2 className="mr-2 h-4 w-4" />
              Redo
              <DropdownMenuShortcut>Ctrl+Y</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSearch} data-testid="menu-edit-search">
              <Search className="mr-2 h-4 w-4" />
              Search
              <DropdownMenuShortcut>Ctrl+F</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReplace} data-testid="menu-edit-replace">
              <Replace className="mr-2 h-4 w-4" />
              Replace
              <DropdownMenuShortcut>Ctrl+H</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="menu-view">
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={toggleSidebar} data-testid="menu-view-sidebar">
              {showSidebar ? (
                <PanelLeftClose className="mr-2 h-4 w-4" />
              ) : (
                <PanelLeftOpen className="mr-2 h-4 w-4" />
              )}
              {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={togglePreview} data-testid="menu-view-preview">
              {showPreview ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark")}>
              <DropdownMenuRadioItem value="light" data-testid="menu-theme-light">
                <Sun className="mr-2 h-4 w-4" />
                Light Theme
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" data-testid="menu-theme-dark">
                <Moon className="mr-2 h-4 w-4" />
                Dark Theme
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="menu-tools">
              Tools
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={toggleTableBuilder} data-testid="menu-tools-table">
              <Table2 className="mr-2 h-4 w-4" />
              Table Builder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleSidebar} data-testid="menu-tools-outline">
              <List className="mr-2 h-4 w-4" />
              Document Outline
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileCode className="mr-2 h-4 w-4" />
                Markdown Tools
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="flex flex-col gap-1 p-2">
                <HeadingDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <HeaderTemplateDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <FooterDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <BoxDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <BorderDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <TableDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <CodeDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <ParagraphDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleSettings} data-testid="menu-tools-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          data-testid="button-theme-toggle"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
