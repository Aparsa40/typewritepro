import { useMemo, useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/lib/store";
import { renderMarkdown, getMarkdownStyles } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MarkdownPreview() {
  const { content, theme, settings, scrollPosition, setScrollPosition, cursorPosition } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isSyncingFromEditor = useRef(false);

  const html = useMemo(() => {
    return renderMarkdown(content, settings.autoDirection);
  }, [content, settings.autoDirection]);

  const styles = useMemo(() => {
    return getMarkdownStyles(theme);
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

  // When editor cursor moves, scroll preview to corresponding element (data-source-line)
  useEffect(() => {
    const line = cursorPosition?.line ?? 1;
    if (!previewRef.current) return;
    const el = previewRef.current.querySelector(`[data-source-line=\"${line}\"]`) as HTMLElement | null;
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
    <div className="h-full w-full flex flex-col" data-testid="markdown-preview-container">
      <style>{styles}</style>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div
          ref={previewRef}
          className="markdown-preview p-8 cursor-pointer"
          style={{
            fontFamily: `'Inter', 'Vazirmatn', system-ui, sans-serif`,
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
          data-testid="markdown-preview-content"
          onClick={handlePreviewClick}
        />
      </ScrollArea>
    </div>
  );
}
