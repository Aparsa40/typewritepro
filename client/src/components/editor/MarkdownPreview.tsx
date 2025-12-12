import { useMemo, useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/lib/store";
import { renderMarkdown, getMarkdownStyles } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageEditorOverlay } from "./ImageEditorOverlay";

export function MarkdownPreview() {
  const { content, theme, settings, scrollPosition, setScrollPosition, cursorPosition, pageSettings, currentWorkspaceId, setContent } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isSyncingFromEditor = useRef(false);

  const html = useMemo(() => {
    return renderMarkdown(content, settings.autoDirection);
  }, [content, settings.autoDirection]);

  const styles = useMemo(() => {
    return getMarkdownStyles();
  }, [theme]);

  useEffect(() => {
    if (previewRef.current) {
      const links = previewRef.current.querySelectorAll("a");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });
    }
  }, [html]);

  // Apply header line and sticky behavior if requested in page settings
  useEffect(() => {
    if (!previewRef.current) return;
    const headerEl = previewRef.current.querySelector("header") as HTMLElement | null;
    if (!headerEl) return;
    if (pageSettings?.headerLine) {
      headerEl.style.position = "sticky";
      headerEl.style.top = "0";
      headerEl.style.zIndex = "10";
      headerEl.style.background = pageSettings.backgroundColor || "transparent";
      headerEl.style.borderBottom = `${pageSettings.borderWidth || 1}px solid ${pageSettings.borderColor || "#e5e7eb"}`;
    } else {
      headerEl.style.position = "static";
      headerEl.style.borderBottom = "none";
    }
  }, [html, pageSettings]);

  // When editor cursor moves, scroll preview to corresponding element (data-source-line)
  useEffect(() => {
    const line = cursorPosition?.line ?? 1;
    if (!previewRef.current) return;
    const el = previewRef.current.querySelector(`[data-source-line="${line}"]`) as HTMLElement | null;
    if (el) {
      isSyncingFromEditor.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Clear flag after a short delay
      setTimeout(() => {
        isSyncingFromEditor.current = false;
      }, 250);
    }
  }, [cursorPosition?.line]);

  // Sync preview scroll with editor
  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
    if (!scrollViewport) return;

    const handlePreviewScroll = () => {
      const scrollHeight = scrollViewport.scrollHeight;
      const clientHeight = scrollViewport.clientHeight;
      const scrollTop = scrollViewport.scrollTop;
      const scrollPercent = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
      if (isSyncingFromEditor.current) {
        // Ignore scroll events triggered by editor -> preview sync
        return;
      }
      setScrollPosition("preview", scrollPercent);
    };

    scrollViewport.addEventListener("scroll", handlePreviewScroll);
    return () => scrollViewport.removeEventListener("scroll", handlePreviewScroll);
  }, [setScrollPosition]);

  // Respond to editor scroll changes: when store.scrollPosition.editor updates, set preview scroll
  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
    if (!scrollViewport) return;

    const editorPercent = scrollPosition?.editor ?? 0;
    const scrollHeight = scrollViewport.scrollHeight;
    const clientHeight = scrollViewport.clientHeight;
    const top = scrollHeight > clientHeight ? (editorPercent / 100) * (scrollHeight - clientHeight) : 0;

    isSyncingFromEditor.current = true;
    scrollViewport.scrollTop = top;
    setTimeout(() => {
      isSyncingFromEditor.current = false;
    }, 250);
  }, [scrollPosition?.editor]);

  // Handle click in preview to sync editor
  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest(".markdown-preview");
    if (!target) return;

    // Find which line this element corresponds to
    let element = e.target as HTMLElement;
    while (element && element !== target) {
      if (element.hasAttribute("data-source-line")) {
        const line = parseInt(element.getAttribute("data-source-line") || "1");
        (window as any).goToEditorLine?.(line);
        break;
      }
      element = element.parentElement as HTMLElement;
    }
  }, []);

  return (
    <div
      className="h-full w-full flex flex-col"
      data-testid="markdown-preview-container"
      style={{
        position: 'relative',
        // Apply workspace background to the full preview container so it covers the whole page area
        background: currentWorkspaceId ? pageSettings?.backgroundColor : undefined,
        backgroundImage: currentWorkspaceId && pageSettings?.backgroundImage ? `url(${pageSettings.backgroundImage})` : undefined,
        backgroundSize: currentWorkspaceId && pageSettings?.backgroundImage ? 'cover' : undefined,
        backgroundRepeat: currentWorkspaceId && pageSettings?.backgroundImage ? 'no-repeat' : undefined,
        backgroundPosition: currentWorkspaceId && pageSettings?.backgroundImage ? 'center' : undefined,
      }}
    >
      <style>{styles}</style>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div
          ref={previewRef}
          className="markdown-preview cursor-pointer"
          style={{
            fontFamily: pageSettings?.fontFamily ? `${pageSettings.fontFamily}, Inter, Vazirmatn, system-ui, sans-serif` : `'Inter', 'Vazirmatn', system-ui, sans-serif`,
            fontSize: pageSettings?.fontSize ?? settings.fontSize,
            lineHeight: settings.lineHeight,
            // Keep inner content transparent so container background shows through
            background: 'transparent',
            backgroundImage: undefined,
            padding: pageSettings?.padding ?? 32,
            boxSizing: 'border-box',
            // Apply border according to page settings so preview/print match editor expectations (for workspace pages)
            border: currentWorkspaceId && pageSettings?.borderStyle && pageSettings?.borderStyle !== 'none' ? `${pageSettings.borderWidth || 1}px ${pageSettings.borderStyle === 'double' ? 'double' : 'solid'} ${pageSettings.borderColor || '#e5e7eb'}` : undefined,
            borderRadius: currentWorkspaceId && pageSettings?.borderStyle && pageSettings?.borderStyle !== 'none' ? 6 : undefined,
            overflowX: 'auto',
            width: '100%',
            display: 'block',
            minHeight: '100%',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
          data-testid="markdown-preview-content"
          onClick={handlePreviewClick}
        />
      </ScrollArea>
      {/* Overlay for interactive image editing */}
      <ImageEditorOverlay previewRef={previewRef} content={content} setContent={setContent} />
    </div>
  );
}
