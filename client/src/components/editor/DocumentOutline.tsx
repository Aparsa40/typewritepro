import { useCallback } from "react";
import { FileText, Hash, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DocumentOutline() {
  const { headings, showSidebar, wordCount, charCount, detectedDirection } = useEditorStore();

  const handleHeadingClick = useCallback((line: number) => {
    const goToEditorLine = (window as any).goToEditorLine;
    if (goToEditorLine) {
      goToEditorLine(line);
    }
  }, []);

  if (!showSidebar) return null;

  return (
    <aside className="w-[280px] border-r bg-sidebar flex flex-col h-full flex-shrink-0" data-testid="document-outline">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Document Outline
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {headings.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 text-center">
              <p>No headings found</p>
              <p className="text-xs mt-1">Add headings using # in your document</p>
            </div>
          ) : (
            <nav className="space-y-1">
              {headings.map((heading) => (
                <Button
                  key={heading.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto py-2 px-2 font-normal",
                    heading.level === 1 && "font-medium",
                    heading.level > 1 && "text-muted-foreground"
                  )}
                  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                  onClick={() => handleHeadingClick(heading.line)}
                  data-testid={`heading-${heading.id}`}
                >
                  <Hash className="w-3 h-3 mr-2 flex-shrink-0 opacity-50" />
                  <span className="truncate text-sm">{heading.text}</span>
                </Button>
              ))}
            </nav>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4 space-y-3 bg-muted/30">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Document Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-md p-3 border">
            <p className="text-2xl font-semibold">{wordCount}</p>
            <p className="text-xs text-muted-foreground">Words</p>
          </div>
          <div className="bg-background rounded-md p-3 border">
            <p className="text-2xl font-semibold">{charCount}</p>
            <p className="text-xs text-muted-foreground">Characters</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ChevronRight className="w-3 h-3" />
          <span>
            Direction:{" "}
            <span className="font-medium text-foreground">
              {detectedDirection === "rtl" ? "RTL (فارسی)" : detectedDirection === "mixed" ? "Mixed" : "LTR"}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
}
