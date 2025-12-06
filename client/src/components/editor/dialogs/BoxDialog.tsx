import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBox, BoxConfig } from "@/lib/markdown-blocks";

export function BoxDialog({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("محتوای باکس");
  const [bgColor, setBgColor] = useState("#f5f5f5");
  const [textColor, setTextColor] = useState("#333333");
  const [fontSize, setFontSize] = useState("14");
  const [borderWidth, setBorderWidth] = useState("1");
  const [borderColor, setBorderColor] = useState("#cccccc");
  const [borderRadius, setBorderRadius] = useState("8");
  const [padding, setPadding] = useState("16");
  const [align, setAlign] = useState<"left" | "center" | "right">("right");

  const handleInsert = useCallback(() => {
    const config: BoxConfig = {
      content,
      backgroundColor: bgColor,
      textColor,
      fontSize: parseInt(fontSize),
      fontFamily: "'Vazirmatn', system-ui, sans-serif",
      borderWidth: parseInt(borderWidth),
      borderColor,
      borderRadius: parseInt(borderRadius),
      padding: parseInt(padding),
      textAlign: align,
    };
    onInsert(generateBox(config));
    setOpen(false);
  }, [content, bgColor, textColor, fontSize, borderWidth, borderColor, borderRadius, padding, align, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          باکس
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>افزودن Box / باکس محتوا</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>محتوا</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="محتوای باکس" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>پس‌زمینه</Label>
              <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
            <div>
              <Label>رنگ متن</Label>
              <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>اندازه فونت (px)</Label>
            <Input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ضخامت حاشیه (px)</Label>
              <Input type="number" value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)} />
            </div>
            <div>
              <Label>رنگ حاشیه</Label>
              <Input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>گردی گوشه‌ها (px)</Label>
              <Input type="number" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} />
            </div>
            <div>
              <Label>فاصله داخلی (px)</Label>
              <Input type="number" value={padding} onChange={(e) => setPadding(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>جهت متن</Label>
            <Select value={align} onValueChange={(val: any) => setAlign(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">چپ</SelectItem>
                <SelectItem value="center">وسط</SelectItem>
                <SelectItem value="right">راست</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInsert} className="w-full">
            افزودن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
