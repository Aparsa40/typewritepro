import { useMemo, useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/store";
import { renderMarkdown, getMarkdownStyles } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MarkdownPreview() {
  const { content, theme, settings } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="h-full w-full flex flex-col" data-testid="markdown-preview-container">
      <style>{styles}</style>
      <ScrollArea className="flex-1">
        <div
          ref={previewRef}
          className="markdown-preview p-8"
          style={{
            fontFamily: `'Inter', 'Vazirmatn', system-ui, sans-serif`,
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
          data-testid="markdown-preview-content"
        />
      </ScrollArea>
    </div>
  );
}
