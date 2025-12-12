import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditorStore } from '@/lib/store';

export function CreatePageDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Untitled Page');
  const [path, setPath] = useState('');
  const createPageInCurrentWorkspace = useEditorStore((s) => s.createPageInCurrentWorkspace);
  const createWorkspace = useEditorStore((s) => s.createWorkspace);
  const currentWorkspaceId = useEditorStore((s) => s.currentWorkspaceId);

  const handleCreate = () => {
    let wsId = currentWorkspaceId;
    if (!wsId) {
      wsId = createWorkspace('My Workspace');
    }
    // createPageInCurrentWorkspace will auto-open the page
    createPageInCurrentWorkspace(title || 'Untitled Page', path || undefined);
    setOpen(false);
    setTitle('Untitled Page');
    setPath('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create New Page</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Save location</label>
            <div className="flex gap-2 items-center">
              <Input value={path} readOnly placeholder="Choose a folder or Drive..." />
              <Button variant="outline" onClick={async () => {
                try {
                  // @ts-ignore
                  if ((window as any).showDirectoryPicker) {
                    // @ts-ignore
                    const dir = await (window as any).showDirectoryPicker();
                    setPath(`local:${dir.name}`);
                  } else {
                    const fallback = window.prompt('Enter a save path or Drive location');
                    if (fallback) setPath(fallback);
                  }
                } catch (e) {
                  // user cancelled
                }
              }}>Choose...</Button>
              <Button variant="ghost" onClick={() => {
                // Placeholder: connect to Drive or open Drive picker
                // For now, instruct the user to connect via the Workspace -> Export/Drive menu
                alert('To save to Google Drive, connect the Drive integration via File > Export > Connect to Google Drive first.');
              }}>Drive</Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePageDialog;
