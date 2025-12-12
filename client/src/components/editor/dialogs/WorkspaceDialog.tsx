import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/lib/store";
import { WorkspacePageSettingsDialog } from "./WorkspacePageSettingsDialog";

export function WorkspaceDialog() {
  const { workspaces, currentWorkspaceId, createWorkspace, setCurrentWorkspace, createPageInCurrentWorkspace, openDocument, deleteWorkspace } = useEditorStore();
  const [open, setOpen] = useState(false);
  React.useEffect(() => {
    const handler = (e: Event) => setOpen(true);
    window.addEventListener('open-workspace-dialog', handler);
    return () => window.removeEventListener('open-workspace-dialog', handler);
  }, []);
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleCreate = () => {
    if (!name) return;
    const id = createWorkspace(name);
    setName("");
    setCurrentWorkspace(id);
    setOpen(false);
  };

  const handleCreatePageFor = (workspaceId: string) => {
    // ensure workspace is active
    setCurrentWorkspace(workspaceId);
    const doc = createPageInCurrentWorkspace("New Page");
    if (doc) {
      openDocument(doc);
    }
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    const ok = confirm("آیا از حذف ورک‌اسپیس اطمینان دارید؟ این عمل قابل بازگشت نیست.");
    if (!ok) return;
    const success = deleteWorkspace(workspaceId);
    if (!success) alert("نمی‌توان آخرین ورک‌اسپیس را حذف کرد.");
  };

  const toggleExpanded = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">Workspace</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspaces</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Create new workspace</label>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name" />
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>

          <div>
            <label className="text-sm">Existing</label>
            <div className="grid gap-2 mt-2">
              {workspaces.map((w) => (
                <div key={w.id} className={`p-2 border rounded ${w.id === currentWorkspaceId ? "bg-muted/30" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{w.name}</div>
                      <div className="text-xs text-muted-foreground">{w.pages.length} pages</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={w.id === currentWorkspaceId ? "secondary" : "ghost"} onClick={() => setCurrentWorkspace(w.id)}>Switch</Button>
                      <Button size="sm" onClick={() => handleCreatePageFor(w.id)}>Create Page</Button>
                      <WorkspacePageSettingsDialog workspaceId={w.id} triggerLabel={expanded[w.id] ? "Settings" : "Advanced"} />
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteWorkspace(w.id)}>Delete</Button>
                    </div>
                  </div>

                  {expanded[w.id] && (
                    <div className="mt-2 grid gap-2">
                      {w.pages.length === 0 ? (
                        <div className="text-xs text-muted-foreground">No pages</div>
                      ) : (
                        w.pages.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="text-sm">{p.title}</div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => openDocument(p)}>Open</Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WorkspaceDialog;
