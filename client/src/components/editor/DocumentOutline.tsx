import { useCallback } from "react";
import { FileText, Hash, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { WorkspacePageSettingsDialog } from "./dialogs/WorkspacePageSettingsDialog";

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
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => {
            const title = window.prompt('Enter new page title');
            if (!title) return;
            // Instead of asking the user to type a save path, open a native folder picker
            (async () => {
              let chosenPath: string | undefined = undefined;
              try {
                // If the browser supports the directory picker, open it
                // Note: this will only work in Chromium-based browsers with the File System Access API
                // We store a small hint in the savePath (e.g. local:<name>) so it's visible in the UI
                // Actual saving logic should re-open a picker when writing the file.
                // @ts-ignore
                if ((window as any).showDirectoryPicker) {
                  // @ts-ignore
                  const dir = await (window as any).showDirectoryPicker();
                  chosenPath = `local:${dir.name}`;
                } else {
                  // Fallback: still allow a prompt to paste a path
                  chosenPath = window.prompt('Optional: enter a save path (local or cloud)') || undefined;
                }
              } catch (e) {
                // user cancelled or API not available
                chosenPath = undefined;
              }

              const state = useEditorStore.getState();
              // ensure a workspace exists
              let wsId = state.currentWorkspaceId;
              if (!wsId) {
                wsId = state.createWorkspace('My Space');
              }
              state.setCurrentWorkspace(wsId);
              const doc = state.createPageInCurrentWorkspace(title, chosenPath || undefined);
              if (doc) state.openDocument(doc);
            })();
          }}>Create New Page</Button>

          <Button size="sm" onClick={() => {
            // Open the Workspace dialog so the user can choose/inspect pages
            try {
              window.dispatchEvent(new Event('open-workspace-dialog'));
            } catch (e) {
              // Fallback: scroll into view of the user pages list
              const el = document.getElementById('user-pages-list');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}>User Pages</Button>
        </div>
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

      <div id="user-pages-list" className="border-t p-4 space-y-3 bg-muted/30 flex-1 flex flex-col">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">User Pages</h3>
        <div className="overflow-auto max-h-60 flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pr-2">#</th>
                <th className="pr-2">Title</th>
                <th className="pr-2">Created</th>
                <th className="pr-2">Workspace</th>
                <th className="pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const state = useEditorStore.getState();
                const rows: Array<{ idx: number; page: any; workspaceName: string; workspaceId: string }> = [];
                state.workspaces.forEach((w) => {
                  w.pages.forEach((p, i) => rows.push({ idx: rows.length + 1, page: p, workspaceName: w.name, workspaceId: w.id }));
                });
                if (rows.length === 0) return <tr><td colSpan={5} className="text-xs text-muted-foreground">No user pages</td></tr>;
                return rows.map((r, i) => (
                  <tr key={r.page.id} className="border-t">
                    <td className="py-2 pr-2 align-top">{i + 1}</td>
                    <td className="py-2 pr-2 align-top">{r.page.title}</td>
                    <td className="py-2 pr-2 align-top text-xs text-muted-foreground">{new Date(r.page.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-2 align-top text-xs">{r.workspaceName}</td>
                    <td className="py-2 pr-2 align-top">
                      <div className="flex gap-2">
                        <WorkspacePageSettingsDialog workspaceId={r.workspaceId} triggerLabel="Settings" />
                        <Button size="sm" onClick={() => { useEditorStore.getState().openDocument(r.page); }}>Open</Button>
                        <Button size="sm" onClick={() => { useEditorStore.getState().saveDocument(); }}>Save</Button>
                        <Button size="sm" variant="destructive" onClick={() => {
                          const ok = confirm('Delete this page?');
                          if (!ok) return;
                          useEditorStore.getState().deletePageFromWorkspace(r.workspaceId, r.page.id);
                        }}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        <div className="border-t pt-4 space-y-3 mt-4">
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
      </div>
    </aside>
  );
}
