import { FileText, Type, AlignLeft, AlignRight, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/lib/store";

export function StatusBar() {
  const {
    cursorPosition,
    wordCount,
    charCount,
    detectedDirection,
    settings,
    isModified,
  } = useEditorStore();

  return (
    <footer className="h-8 border-t bg-muted/30 flex items-center justify-between px-4 text-xs text-muted-foreground flex-shrink-0" data-testid="status-bar">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Markdown
          {isModified && <span className="text-primary">*</span>}
        </span>
        <span>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" />
          {settings.fontFamily}
        </span>
        <span>{settings.fontSize}px</span>
        <span className="flex items-center gap-1.5">
          {detectedDirection === "rtl" ? (
            <AlignRight className="w-3.5 h-3.5" />
          ) : (
            <AlignLeft className="w-3.5 h-3.5" />
          )}
          {detectedDirection === "rtl" ? "RTL" : detectedDirection === "mixed" ? "Mixed" : "LTR"}
        </span>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
      </div>
    </footer>
  );
}
