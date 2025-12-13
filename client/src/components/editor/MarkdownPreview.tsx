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
    // Load character mapping attached as JSON script into window.__typewriter_char_map
    try {
      const script = previewRef.current?.querySelector('#typewriter-char-map');
      if (script && script.textContent) {
        (window as any).__typewriter_char_map = (window as any).__typewriter_char_map || {};
        const parsed = JSON.parse(script.textContent);
        Object.assign((window as any).__typewriter_char_map, parsed);
      }
    } catch (err) {
      console.warn('Failed to parse char map', err);
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
  // We attempt to match not only the line but the approximate column within the line
  useEffect(() => {
    const line = cursorPosition?.line ?? 1;
    const column = cursorPosition?.column ?? 1;
    if (!previewRef.current) return;
    // Find the exact anchor, or fallback to the nearest previous line that has an anchor
    let el = previewRef.current.querySelector(`[data-source-line="${line}"]`) as HTMLElement | null;
    if (!el) {
      for (let i = line - 1; i >= 1; i--) {
        el = previewRef.current.querySelector(`[data-source-line="${i}"]`) as HTMLElement | null;
        if (el) break;
      }
    }
    if (el) {
      try {
        const scrollViewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
        // compute character fraction on the source line so we can scroll to an estimated position within the element
        const lines = content.split('\n');
        const lineText = (lines[line - 1] || "");
        const frac = Math.min(1, Math.max(0, (column - 1) / Math.max(1, lineText.length)));

        isSyncingFromEditor.current = true;

        if (scrollViewport) {
          const elTop = el.offsetTop;
          const elHeight = el.clientHeight || el.scrollHeight || 0;
          const centerOffset = scrollViewport.clientHeight / 2;
          // Estimate target scroll top so the clicked column is approximately centered
          const target = elTop + Math.round(elHeight * frac) - centerOffset;
          scrollViewport.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
        } else {
          // Fallback to simple reveal
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } finally {
        // Clear flag after a short delay
        setTimeout(() => {
          isSyncingFromEditor.current = false;
        }, 250);
      }
    }
  }, [cursorPosition?.line, cursorPosition?.column, content]);

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

        // Try to calculate a more precise column by using caret position from click coordinates
        let column = 1;
        // Prefer exact mapping if available: find a parent wrapper span that has data-char-wrapper
        try {
          const doc: Document = target.ownerDocument || document;
          // caretRangeFromPoint is supported in WebKit/Chrome, caretPositionFromPoint in Firefox
          const range: Range | null = (doc as any).caretRangeFromPoint
            ? (doc as any).caretRangeFromPoint(e.clientX, e.clientY)
            : (doc as any).caretPositionFromPoint
            ? (() => { const p = (doc as any).caretPositionFromPoint(e.clientX, e.clientY); const r = document.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); return r; })()
            : null;
          if (range && range.startContainer) {
            // Find wrapper span that contains the startContainer (closest ancestor)
            let node = range.startContainer as Node | null;
            let wrapperEl: HTMLElement | null = null;
            while (node && node !== target) {
              if (node instanceof HTMLElement && node.hasAttribute('data-char-wrapper')) {
                wrapperEl = node;
                break;
              }
              node = node.parentElement;
            }
            if (wrapperEl && (wrapperEl as HTMLElement).hasAttribute('data-char-wrapper')) {
              const wid = (wrapperEl as HTMLElement).getAttribute('data-char-wrapper')!;
              const mapping = (window as any).__typewriter_char_map?.[wid];
              if (Array.isArray(mapping)) {
                // Expect wrapper to contain a single text node; find offset
                const offsetInText = range.startOffset || 0;
                // if wrapper has more than one child (like inline elements), compute offset by summing text lengths
                let offset = offsetInText;
                if (range.startContainer.nodeType !== Node.TEXT_NODE) {
                  // compute offset within wrapper by iterating child text nodes
                  let curOffset = 0;
                  const walker = document.createTreeWalker(wrapperEl, NodeFilter.SHOW_TEXT, null);
                  let tn = walker.nextNode() as Text | null;
                  while (tn) {
                    if (tn === range.startContainer) { offset = curOffset + (range.startOffset || 0); break; }
                    curOffset += (tn.nodeValue || '').length;
                    tn = walker.nextNode() as Text | null;
                  }
                }
                const mappingIndex = offset;
                const mappedCol = mappingIndex < mapping.length ? mapping[mappingIndex] : mapping[mapping.length - 1];
                column = mappedCol + 1; // convert 0-based to 1-based
              }
            } else if (range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
              // fallback to fraction mapping
              let charOffset = range.startOffset;
              const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
              const firstNode = walker.firstChild();
              if (firstNode) walker.currentNode = firstNode;
              let total = 0;
              while (walker.nextNode()) {
                const n = walker.currentNode;
                if (n === range.startContainer) { total += range.startOffset; break; }
                total += (n?.textContent?.length || 0);
              }
              const sourceLines = content.split('\n');
              const sourceLine = sourceLines[line - 1] || '';
              const fraction = total / Math.max(1, (element.textContent || '').length);
              column = Math.max(1, Math.round(fraction * Math.max(1, sourceLine.length)));
            }
          }
        } catch (err) {
          // ignore fallback
        }

        (window as any).goToEditorPosition?.(line, column);
        break;
      }
      element = element.parentElement as HTMLElement;
    }
  }, [content]);

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
            // pageSettings.lineSpacing is a multiplier like 1.6 => set CSS line-height accordingly
            lineHeight: pageSettings?.lineSpacing ?? settings.lineHeight,
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
