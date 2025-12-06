import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { generateParagraph, ParagraphConfig } from "@/lib/markdown-blocks";

export function ParagraphDialog({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("متن پاراگراف شما اینجا...");
  const [farsiFont, setFarsiFont] = useState<"Nazanin" | "Vazirmatn" | "IRANSans">("Nazanin");
  const [englishFont, setEnglishFont] = useState<"Inter" | "JetBrains Mono" | "Monospace">("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [lineHeight, setLineHeight] = useState<1.5 | 1.8 | 2>(1.8);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textAlign, setTextAlign] = useState<"left" | "right" | "center" | "justify">("right");

  const handleInsert = useCallback(() => {
    const config: ParagraphConfig = {
      content,
      farsiFont,
      englishFont,
      fontSize,
      color,
      backgroundColor: backgroundColor || undefined,
      lineHeight,
      letterSpacing,
      textAlign,
    };
    onInsert(generateParagraph(config));
    setOpen(false);
  }, [content, farsiFont, englishFont, fontSize, color, backgroundColor, lineHeight, letterSpacing, textAlign, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          پاراگراف
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>افزودن پاراگراف استایل‌دار / Paragraph</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <Label>متن پاراگراف</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="متن پاراگراف را اینجا بنویسید..."
              className="min-h-24 resize-none"
              dir="auto"
            />
          </div>

          {/* Fonts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>فونت فارسی</Label>
              <Select value={farsiFont} onValueChange={(v) => setFarsiFont(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nazanin">Nazanin (کلاسیک)</SelectItem>
                  <SelectItem value="Vazirmatn">Vazirmatn (مدرن)</SelectItem>
                  <SelectItem value="IRANSans">Iran Sans (صمیمی)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>فونت انگلیسی</Label>
              <Select value={englishFont} onValueChange={(v) => setEnglishFont(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter (صاف)</SelectItem>
                  <SelectItem value="JetBrains Mono">JetBrains Mono (کد)</SelectItem>
                  <SelectItem value="Monospace">Monospace (ستون‌دار)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <Label>سایز فونت: {fontSize}px</Label>
            <Slider
              value={[fontSize]}
              onValueChange={(v) => setFontSize(v[0])}
              min={12}
              max={32}
              step={1}
              className="w-full"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>رنگ متن</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#000000" />
              </div>
            </div>
            <div>
              <Label>رنگ پس‌زمینه (اختیاری)</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="transparent"
                />
              </div>
            </div>
          </div>

          {/* Line Height */}
          <div>
            <Label>فاصله خطوط</Label>
            <Select value={lineHeight.toString()} onValueChange={(v) => setLineHeight(parseFloat(v) as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.5">1.5 (معمول)</SelectItem>
                <SelectItem value="1.8">1.8 (راحت)</SelectItem>
                <SelectItem value="2">2 (بسیار راحت)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Letter Spacing */}
          <div>
            <Label>فاصله حروف: {letterSpacing}px</Label>
            <Slider
              value={[letterSpacing]}
              onValueChange={(v) => setLetterSpacing(v[0])}
              min={0}
              max={4}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Text Alignment */}
          <div>
            <Label>تراز متن</Label>
            <Select value={textAlign} onValueChange={(v) => setTextAlign(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">راست‌چین</SelectItem>
                <SelectItem value="left">چپ‌چین</SelectItem>
                <SelectItem value="center">وسط‌چین</SelectItem>
                <SelectItem value="justify">جسه‌جو</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-semibold mb-2">پیش‌نمایش:</p>
            <div
              dir="auto"
              style={{
                fontFamily: `'${farsiFont}', '${englishFont}'`,
                fontSize: `${fontSize}px`,
                color,
                backgroundColor: backgroundColor || "transparent",
                lineHeight: lineHeight,
                letterSpacing: `${letterSpacing}px`,
                textAlign: textAlign === "justify" ? "justify" : textAlign,
                padding: backgroundColor ? "1rem" : "0",
                borderRadius: "4px",
              }}
            >
              {content}
            </div>
          </div>

          {/* Insert Button */}
          <Button onClick={handleInsert} className="w-full">
            افزودن پاراگراف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
