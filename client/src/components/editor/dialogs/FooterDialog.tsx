import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { generateFooter, FooterConfig } from "@/lib/markdown-blocks";

export function FooterDialog({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("متن فوتر");
  const [pageNumber, setPageNumber] = useState(true);
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [fontSize, setFontSize] = useState("12");
  const [color, setColor] = useState("#666666");

  const handleInsert = useCallback(() => {
    const config: FooterConfig = {
      text,
      pageNumber,
      align,
      fontSize: parseInt(fontSize),
      color,
      fontFamily: "'Vazirmatn', system-ui, sans-serif",
    };
    onInsert(generateFooter(config));
    setOpen(false);
  }, [text, pageNumber, align, fontSize, color, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          فوتر
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>افزودن Footer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>متن فوتر</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="متن فوتر" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={pageNumber} onCheckedChange={(e) => setPageNumber(!!e)} />
            <Label>شماره صفحه</Label>
          </div>
          <div>
            <Label>جهت</Label>
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
          <div>
            <Label>اندازه فونت (px)</Label>
            <Input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
          </div>
          <div>
            <Label>رنگ</Label>
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <Button onClick={handleInsert} className="w-full">
            افزودن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
