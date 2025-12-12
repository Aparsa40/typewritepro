import React, { useCallback, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import { useEditorStore } from "@/lib/store";

interface Props {
  workspaceId?: string;
  triggerLabel?: string;
}

export function WorkspacePageSettingsDialog({ workspaceId, triggerLabel }: Props) {
  const { workspaces, setWorkspacePageSettings, setCurrentWorkspace } = useEditorStore();
  const [open, setOpen] = useState(false);
  const ws = workspaces.find((w) => w.id === workspaceId) || null;

  const [bg, setBg] = useState(ws?.pageSettings.backgroundColor || "#ffffff");
  const [font, setFont] = useState(ws?.pageSettings.fontFamily || "Inter");
  const [padding, setPadding] = useState(ws?.pageSettings.padding || 32);
  const [borderStyle, setBorderStyle] = useState<"none" | "single" | "double">(ws?.pageSettings.borderStyle || "none");
  const [borderColor, setBorderColor] = useState(ws?.pageSettings.borderColor || "#e5e7eb");
  const [borderWidth, setBorderWidth] = useState(ws?.pageSettings.borderWidth || 1);
  const [headerLine, setHeaderLine] = useState(!!ws?.pageSettings.headerLine);

  useEffect(() => {
    if (!ws) return;
    setBg(ws.pageSettings.backgroundColor || "#ffffff");
    setFont(ws.pageSettings.fontFamily || "Inter");
    setPadding(ws.pageSettings.padding || 32);
    setBorderStyle(ws.pageSettings.borderStyle || "none");
    setBorderColor(ws.pageSettings.borderColor || "#e5e7eb");
    setBorderWidth(ws.pageSettings.borderWidth || 1);
    setHeaderLine(!!ws.pageSettings.headerLine);
  }, [ws]);

  const apply = useCallback(() => {
    if (!ws) return;
    setWorkspacePageSettings(ws.id, {
      backgroundColor: bg,
      fontFamily: font,
      padding: Number(padding),
      borderStyle: borderStyle as any,
      borderColor,
      borderWidth: Number(borderWidth),
      headerLine,
    });
    setOpen(false);
  }, [bg, font, padding, borderStyle, borderColor, borderWidth, headerLine, ws, setWorkspacePageSettings]);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && ws) setCurrentWorkspace(ws.id); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">{triggerLabel || "Workspace Page Settings"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workspace Page Settings</DialogTitle>
        </DialogHeader>
        {!ws ? (
          <div>هیچ ورک‌اسپیس فعالی وجود ندارد.</div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Background</Label>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-12 h-10 rounded" />
            </div>
            <div>
              <Label>Font Family</Label>
              <Select value={font} onValueChange={(v) => setFont(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Vazirmatn">Vazirmatn</SelectItem>
                  <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Page Padding (px)</Label>
              <Input value={String(padding)} onChange={(e) => setPadding(Number(e.target.value))} />
            </div>

            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <Label>Border</Label>
                <Select value={borderStyle} onValueChange={(v) => setBorderStyle(v as "none" | "single" | "double") }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Border Color</Label>
                <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-12 h-10 rounded" />
              </div>
              <div>
                <Label>Border Width (px)</Label>
                <Input value={String(borderWidth)} onChange={(e) => setBorderWidth(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label>Header line under header</Label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={headerLine} onChange={(e) => setHeaderLine(e.target.checked)} />
                <span className="text-sm">Show a line under the page header</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2">
                <Label className="font-semibold">Page Appearance</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="w-4 h-4 text-amber-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">After changing appearance settings, click the "Open" button next to the page in the User Pages list to apply changes.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Customize the visual appearance of your page</p>
              <div className="space-y-3">
                <div>
                  <Label>Background Image</Label>
                  <p className="text-xs text-muted-foreground mb-2">Select an image from your system to use as the page background (png/jpg).</p>
                  <div className="flex gap-2">
                    <input id={`bg-image-input-${ws?.id}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file || !ws) return;
                      const url = URL.createObjectURL(file);
                      // set workspace page background image
                      setWorkspacePageSettings(ws.id, { backgroundImage: url });
                    }} />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById(`bg-image-input-${ws?.id}`)?.click()} className="flex-1">Choose Background Image</Button>
                    <Button variant="ghost" size="sm" onClick={() => ws && setWorkspacePageSettings(ws.id, { backgroundImage: undefined })}>Remove</Button>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={apply} className="w-full">Apply</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WorkspacePageSettingsDialog;
