import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorStore } from "@/lib/store";

export function PageSettingsDialog() {
  const { pageSettings, setPageSettings } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [bg, setBg] = useState(pageSettings.backgroundColor || "#ffffff");
  const [font, setFont] = useState(pageSettings.fontFamily || "Inter");
  const [padding, setPadding] = useState(pageSettings.padding || 32);
  const [lineSpacing, setLineSpacing] = useState<number>(pageSettings.lineSpacing || 1.7);
  const [borderStyle, setBorderStyle] = useState<"none" | "single" | "double">(pageSettings.borderStyle || "none");
  const [borderColor, setBorderColor] = useState(pageSettings.borderColor || "#e5e7eb");
  const [borderWidth, setBorderWidth] = useState(pageSettings.borderWidth || 1);
  const [headerLine, setHeaderLine] = useState(!!pageSettings.headerLine);

  const apply = useCallback(() => {
    setPageSettings({
      backgroundColor: bg,
      fontFamily: font,
      padding: Number(padding),
      lineSpacing: Number(lineSpacing),
      borderStyle: borderStyle as any,
      borderColor,
      borderWidth: Number(borderWidth),
      headerLine,
    });
    setOpen(false);
  }, [bg, font, padding, borderStyle, borderColor, borderWidth, headerLine, setPageSettings]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">Page Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Page Settings</DialogTitle>
        </DialogHeader>
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

          <div>
            <Label>Line Spacing</Label>
            <Input type="number" step="0.1" min="1" max="3" value={String(lineSpacing)} onChange={(e) => setLineSpacing(Number(e.target.value))} />
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

          <Button onClick={apply} className="w-full">Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
