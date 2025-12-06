import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateTable, TableConfig } from "@/lib/markdown-blocks";

export function TableDialog({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState("3");
  const [columns, setColumns] = useState("3");
  const [headerBgColor, setHeaderBgColor] = useState("#4a5568");
  const [cellBgColor, setCellBgColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("#e2e8f0");
  const [borderWidth, setBorderWidth] = useState("1");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [fontSize, setFontSize] = useState("14");

  const handleInsert = useCallback(() => {
    const config: TableConfig = {
      rows: parseInt(rows),
      columns: parseInt(columns),
      headerBgColor,
      cellBgColor,
      borderColor,
      borderWidth: parseInt(borderWidth),
      textAlign: align,
      fontSize: parseInt(fontSize),
      fontFamily: "'Vazirmatn', system-ui, sans-serif",
    };
    onInsert(generateTable(config));
    setOpen(false);
  }, [rows, columns, headerBgColor, cellBgColor, borderColor, borderWidth, align, fontSize, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          جدول
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>افزودن جدول / Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تعداد ردیف</Label>
              <Input type="number" value={rows} onChange={(e) => setRows(e.target.value)} min="1" max="20" />
            </div>
            <div>
              <Label>تعداد ستون</Label>
              <Input type="number" value={columns} onChange={(e) => setColumns(e.target.value)} min="1" max="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>رنگ سرتیتر</Label>
              <Input type="color" value={headerBgColor} onChange={(e) => setHeaderBgColor(e.target.value)} />
            </div>
            <div>
              <Label>رنگ سلول‌ها</Label>
              <Input type="color" value={cellBgColor} onChange={(e) => setCellBgColor(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>رنگ خطوط</Label>
              <Input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
            </div>
            <div>
              <Label>ضخامت خطوط (px)</Label>
              <Input type="number" value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)} min="1" max="5" />
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
          <div>
            <Label>اندازه فونت (px)</Label>
            <Input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} min="10" max="24" />
          </div>
          <Button onClick={handleInsert} className="w-full">
            افزودن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
