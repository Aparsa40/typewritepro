import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateHeading, HeadingConfig } from "@/lib/markdown-blocks";

export function HeadingDialog({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<"1" | "2" | "3" | "4" | "5" | "6">("1");
  const [text, setText] = useState("عنوان شما اینجا");

  const handleInsert = useCallback(() => {
    const config: HeadingConfig = {
      level: parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6,
      text,
    };
    onInsert(generateHeading(config));
    setOpen(false);
  }, [level, text, onInsert]);

  const handleLevelChange = useCallback((value: string) => {
    setLevel(value as "1" | "2" | "3" | "4" | "5" | "6");
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          تیتر
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>افزودن تیتر / Heading</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>سطح تیتر</Label>
            <Select value={level} onValueChange={handleLevelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1 - بزرگ‌ترین</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
                <SelectItem value="5">H5</SelectItem>
                <SelectItem value="6">H6 - کوچک‌ترین</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>متن تیتر</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="متن تیتر را وارد کنید" />
          </div>
          <Button onClick={handleInsert} className="w-full">
            افزودن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
