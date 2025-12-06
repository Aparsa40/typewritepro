import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateHeaderTemplate } from "@/lib/markdown-blocks";

export function HeaderTemplateDialog({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('عنوان صفحه');
  const [subject, setSubject] = useState('موضوع');
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [titleFont, setTitleFont] = useState("'Vazirmatn', sans-serif");
  const [metaFont, setMetaFont] = useState("'Inter', sans-serif");
  const [titleSize, setTitleSize] = useState(24);
  const [metaSize, setMetaSize] = useState(14);
  const [titleColor, setTitleColor] = useState('#111827');

  const handleInsert = useCallback(() => {
    const html = generateHeaderTemplate({ title, subject, date, titleFont, metaFont, titleSize, metaSize, titleColor });
    onInsert(html);
    setOpen(false);
  }, [title, subject, date, titleFont, metaFont, titleSize, metaSize, titleColor, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">هدر</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Header Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label>Date</Label>
            <Input value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title Font</Label>
              <Select value={titleFont} onValueChange={(v) => setTitleFont(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="'Vazirmatn', sans-serif">Vazirmatn</SelectItem>
                  <SelectItem value="'IRANSans', sans-serif">IRANSans</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Meta Font</Label>
              <Select value={metaFont} onValueChange={(v) => setMetaFont(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                  <SelectItem value="'JetBrains Mono', monospace">JetBrains Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title Size</Label>
              <Input value={String(titleSize)} onChange={(e) => setTitleSize(Number(e.target.value))} />
            </div>
            <div>
              <Label>Meta Size</Label>
              <Input value={String(metaSize)} onChange={(e) => setMetaSize(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label>Title Color</Label>
            <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-12 h-10 rounded" />
          </div>

          <Button onClick={handleInsert} className="w-full">افزودن هدر</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
