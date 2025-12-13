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
import { WorkspaceDialog } from "./dialogs/WorkspaceDialog";
import { ImageInsertDialog } from "./dialogs/ImageInsertDialog";

export function MenuBar() {
  const {
    content,
    theme,
    setTheme,
    showSidebar,
    showPreview,
    previewMode,
    setPreviewMode,
    setContent,
    toggleSidebar,
    togglePreview,
    toggleSettings,
    toggleTableBuilder,
    newDocument,
    saveDocument,
    createPageInCurrentWorkspace,
    settings,
    pageSettings,
  } = useEditorStore();

  const { toast } = useToast();
  const [imageInsertOpen, setImageInsertOpen] = useState(false);
  const [imageInsertUrl, setImageInsertUrl] = useState("");
  const [imageInsertFileName, setImageInsertFileName] = useState("");


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
    (async () => {
      // Ask user which format to save as
      const fmt = window.prompt('Save as format (md, txt, html, pdf):', 'md') || 'md';
      const format = (fmt || 'md').toLowerCase();
      if (!['md','txt','html','pdf'].includes(format)) {
        toast({ title: 'Invalid format', description: 'Supported: md, txt, html, pdf', variant: 'destructive' });
        return;
      }

      // Determine base filename from document title
      const state = useEditorStore.getState();
      const base = (state.currentDocument?.title || 'document').replace(/[^a-z0-9\-_.\s]/gi, '_').trim();
      const filename = `${base}.${format}`;

      try {
        if ((window as any).showDirectoryPicker) {
          // Let user pick a folder, then write file with fixed name (prevent renaming)
          // This matches the requested behaviour: user chooses location and format but can't change filename
          // Note: showDirectoryPicker is available in Chromium-based browsers
          // @ts-ignore
          const dir = await (window as any).showDirectoryPicker();
          const handle = await dir.getFileHandle(filename, { create: true });
          const writable = await handle.createWritable();

          if (format === 'md' || format === 'txt') {
            await writable.write(content);
          } else if (format === 'html') {
            const html = renderMarkdown(content, true);
            const headings2 = useEditorStore.getState().headings;
            const toc2 = headings2.length ? `<nav class="toc"><h2>Table of Contents</h2><ul>${headings2.map(h=>`<li class="toc-level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul></nav>` : '';
            await writable.write(toc2 + html);
          } else if (format === 'pdf') {
            // Generate PDF blob via exportToPDF which saves via jsPDF; fall back to writing generated PDF blob
            const html = renderMarkdown(content, true);
            const headings2 = useEditorStore.getState().headings;
            const toc2 = headings2.length ? `<nav class="toc"><h2>Table of Contents</h2><ul>${headings2.map(h=>`<li class="toc-level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul></nav>` : '';
            const htmlWithToc = toc2 + html;
            // exportToPDF saves directly via jsPDF.save, but we want a Blob to write to handle
            // Use html2canvas + jsPDF approach to create blob
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlWithToc;
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            const blob = pdf.output('blob');
            await writable.write(blob);
            document.body.removeChild(tempDiv);
          }

          await writable.close();
          toast({ title: 'Saved', description: `Saved ${filename}` });
          return;
        }

        // Fallback: trigger browser download (user may have to choose filename in browser settings)
        if (format === 'html') {
          const html = renderMarkdown(content, true);
          exportToHTML(content, html, filename, { title: state.currentDocument?.title || 'Document' });
        } else if (format === 'pdf') {
          const html = renderMarkdown(content, true);
          await exportToPDF(html, filename, { title: state.currentDocument?.title || 'Document' });
        } else {
          exportToMarkdown(content, filename);
        }
        toast({ title: 'File Downloaded', description: `${filename} has been downloaded.` });
      } catch (err) {
        console.error('Save As error', err);
        toast({ title: 'Save failed', description: 'Could not save file. Check browser permissions.', variant: 'destructive' });
      }
    })();
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
      // Include a table of contents at the top
      const headings = useEditorStore.getState().headings;
      const toc = headings.length ? `<nav class="toc"><h2>Table of Contents</h2><ul>${headings.map(h=>`<li class="toc-level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul></nav>` : '';
      const htmlWithToc = toc + html;
      exportToHTML(content, htmlWithToc, "document.html", {
        title: "TypeWriterPro Document",
        date: new Date(),
        lineHeight: pageSettings?.lineSpacing ?? settings.lineHeight,
        fontFamily: pageSettings?.fontFamily ?? settings.fontFamily,
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
      // Prepend TOC to the HTML used for PDF generation
      const headings = useEditorStore.getState().headings;
      const toc = headings.length ? `<nav class="toc"><h2>Table of Contents</h2><ul>${headings.map(h=>`<li class="toc-level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul></nav>` : '';
      const htmlWithToc = toc + html;
      await exportToPDF(htmlWithToc, "document.pdf", {
        title: "TypeWriterPro Document",
        date: new Date(),
        lineHeight: pageSettings?.lineSpacing ?? settings.lineHeight,
        fontFamily: pageSettings?.fontFamily ?? settings.fontFamily,
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

  const handleSaveSelection = useCallback(() => {
    const selection = window.getSelection?.();
    if (!selection) return;
    const text = selection.toString();
    if (!text) return;
    try {
      const existing = JSON.parse(localStorage.getItem('savedSelections') || '[]');
      existing.push({ id: crypto.randomUUID?.() || Date.now(), text, createdAt: new Date().toISOString() });
      localStorage.setItem('savedSelections', JSON.stringify(existing));
      toast({ title: 'Selection Saved', description: 'Saved highlighted selection locally.' });
    } catch (e) {
      console.error('Save selection error', e);
      toast({ title: 'Save failed', description: 'Could not save the selection.', variant: 'destructive' });
    }
  }, [toast]);

  const openAsLiveHTML = useCallback(() => {
    const win = window.open('', '_blank');
    if (!win) {
      toast({ title: 'Popup Blocked', description: 'Allow popups to render live HTML.', variant: 'destructive' });
      return;
    }
    // If content looks like full HTML or has tags, render it directly; otherwise render the markdown output
    const isHtml = /^\s*\</.test(content);
    const out = isHtml ? content : renderMarkdown(content, true);
    win.document.open();
    win.document.write(out);
    win.document.close();
  }, [content, toast]);

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
        {
          const html = renderMarkdown(content, true);
          const headings2 = useEditorStore.getState().headings;
          const toc2 = headings2.length ? `<nav class="toc"><h2>Table of Contents</h2><ul>${headings2.map(h=>`<li class="toc-level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul></nav>` : '';
          const styleTag = `<style>body { line-height: ${pageSettings?.lineSpacing ?? settings.lineHeight}; font-family: ${pageSettings?.fontFamily ?? settings.fontFamily}; }</style>`;
          contentToUpload = `${styleTag}${toc2}${html}`;
        }
      } else {
        // pdf: generate as Blob via exportToPDF flow but exportToPDF returns file via save
        // Instead, create HTML and upload as pdf by asking server to convert is complex; fallback: upload HTML with .pdf name (not perfect)
        name = 'document.pdf';
        mimeType = 'application/pdf';
        {
          const html = renderMarkdown(content, true);
          const headings2 = useEditorStore.getState().headings;
          const toc2 = headings2.length ? `<nav class="toc"><h2>Table of Contents</h2><ul>${headings2.map(h=>`<li class="toc-level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul></nav>` : '';
          const styleTag = `<style>body { line-height: ${pageSettings?.lineSpacing ?? settings.lineHeight}; font-family: ${pageSettings?.fontFamily ?? settings.fontFamily}; }</style>`;
          contentToUpload = `${styleTag}${toc2}${html}`;
        }
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
            <DropdownMenuItem onClick={handleSaveSelection} data-testid="menu-edit-save-selection">
              <FileText className="mr-2 h-4 w-4" />
              Save Selection
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
            <DropdownMenuItem onClick={() => setPreviewMode(previewMode === 'preview-full' ? 'split' : 'preview-full')}>
              <Eye className="mr-2 h-4 w-4" />
              {previewMode === 'preview-full' ? 'Exit Fullscreen Preview' : 'Enter Fullscreen Preview'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as any)}>
              <DropdownMenuRadioItem value="light" data-testid="menu-theme-light">
                <Sun className="mr-2 h-4 w-4" />
                Light Theme
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" data-testid="menu-theme-dark">
                <Moon className="mr-2 h-4 w-4" />
                Dark Theme
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="ocean" data-testid="menu-theme-ocean">
                Ocean Theme
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="sepia" data-testid="menu-theme-sepia">
                Sepia Theme
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="aurora" data-testid="menu-theme-aurora">
                Aurora Theme
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="dark-blue" data-testid="menu-theme-dark-blue">
                Dark Blue Theme
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="midnight" data-testid="menu-theme-midnight">
                Midnight Theme
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="deep-blue" data-testid="menu-theme-deep-blue">
                Deep Blue Theme
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="plum" data-testid="menu-theme-plum">
                Plum Theme
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
                <FileText className="mr-2 h-4 w-4" />
                Workspace
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <WorkspaceDialog />
                <div className="px-2">
                  <Button variant="ghost" size="sm" onClick={() => createPageInCurrentWorkspace("New Page")} className="w-full text-xs">Create Page in Workspace</Button>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileCode className="mr-2 h-4 w-4" />
                Markdown Tools
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="flex flex-col gap-1 p-2">
                <HeadingDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <HeaderTemplateDialog onInsert={(text) => { setContent(text + "\n\n" + content); }} />
                <FooterDialog onInsert={(text) => { setContent(content + "\n\n" + text); }} />
                <BoxDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <BorderDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <TableDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <CodeDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <ParagraphDialog onInsert={(text) => (window as any).insertTextAtCursor?.(text)} />
                <div className="px-2">
                  <Button variant="ghost" size="sm" onClick={openAsLiveHTML} className="w-full text-xs">Render as Live HTML/CSS/JS</Button>
                </div>
                <div className="px-2">
                  <input id="menu-insert-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setImageInsertUrl(url);
                    setImageInsertFileName(file.name);
                    setImageInsertOpen(true);
                  }} />
                  <Button variant="ghost" size="sm" onClick={() => document.getElementById('menu-insert-image-input')?.click()} className="w-full text-xs">Insert Image</Button>
                </div>
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

      <ImageInsertDialog 
        open={imageInsertOpen} 
        onClose={() => {
          setImageInsertOpen(false);
          setImageInsertUrl("");
          setImageInsertFileName("");
        }}
        imageUrl={imageInsertUrl}
        fileName={imageInsertFileName}
        onInsert={(markdown) => {
          setContent(content + "\n\n" + markdown);
          setImageInsertOpen(false);
          setImageInsertUrl("");
          setImageInsertFileName("");
        }}
      />
    </header>
  );
}
