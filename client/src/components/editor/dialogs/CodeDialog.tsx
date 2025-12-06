import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateCodeBlock, CodeConfig } from "@/lib/markdown-blocks";

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "xml",
  "json",
  "bash",
  "shell",
];

export function CodeDialog({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState('console.log("کد شما اینجا");');
  const [fontSize, setFontSize] = useState("13");

  const handleInsert = useCallback(() => {
    const config: CodeConfig = {
      language,
      code: code || 'console.log("");',
      fontSize: parseInt(fontSize),
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    };
    onInsert(generateCodeBlock(config));
    setOpen(false);
  }, [language, code, fontSize, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          کد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>افزودن بلوک کد / Code Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>زبان برنامه‌نویسی</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>کد</Label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="کد خود را اینجا وارد کنید"
              className="font-mono h-40"
            />
          </div>
          <div>
            <Label>اندازه فونت (px)</Label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              min="10"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button onClick={handleInsert} className="w-full">
            افزودن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
