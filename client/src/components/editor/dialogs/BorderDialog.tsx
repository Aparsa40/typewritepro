import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBorderWrapper } from "@/lib/markdown-blocks";

export function BorderDialog({ onInsert, children }: { onInsert: (text: string) => void; children?: any }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<'solid' | 'dashed' | 'double'>('solid');
  const [color, setColor] = useState('#e5e7eb');
  const [width, setWidth] = useState(1);
  const [radius, setRadius] = useState(6);
  const [padding, setPadding] = useState(12);
  const sampleContent = '<p dir="auto">نمونه محتوا داخل باکس</p>';

  const handleInsert = useCallback(() => {
    const html = generateBorderWrapper(sampleContent, { borderStyle: style, color, width, radius, padding });
    onInsert(html);
    setOpen(false);
  }, [style, color, width, radius, padding, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">باکس‌قاب</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Border / قاب</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Style</Label>
            <Select value={style} onValueChange={(v) => setStyle(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="double">Double</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color</Label>
              <div className="flex gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 rounded" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Width (px)</Label>
              <Input value={String(width)} onChange={(e) => setWidth(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Border Radius (px)</Label>
              <Input value={String(radius)} onChange={(e) => setRadius(Number(e.target.value))} />
            </div>
            <div>
              <Label>Padding (px)</Label>
              <Input value={String(padding)} onChange={(e) => setPadding(Number(e.target.value))} />
            </div>
          </div>

          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-semibold mb-2">پیش‌نمایش:</p>
            <div dangerouslySetInnerHTML={{ __html: generateBorderWrapper(sampleContent, { borderStyle: style, color, width, radius, padding }) }} />
          </div>

          <Button onClick={handleInsert} className="w-full">افزودن قاب</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
