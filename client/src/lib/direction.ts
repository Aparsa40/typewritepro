import { generateHeadingId } from "./slug";

const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
const ltrChars = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/;

export function detectTextDirection(text: string): "ltr" | "rtl" | "mixed" {
  if (!text || text.trim().length === 0) {
    return "ltr";
  }

  const cleanText = text.replace(/[\s\d.,!?;:'"()\[\]{}<>@#$%^&*+=\-_\/\\|~`]/g, "");
  
  if (cleanText.length === 0) {
    return "ltr";
  }

  let rtlCount = 0;
  let ltrCount = 0;

  for (const char of cleanText) {
    if (rtlChars.test(char)) {
      rtlCount++;
    } else if (ltrChars.test(char)) {
      ltrCount++;
    }
  }

  const total = rtlCount + ltrCount;
  if (total === 0) return "ltr";

  const rtlRatio = rtlCount / total;
  const ltrRatio = ltrCount / total;

  if (rtlRatio > 0.7) return "rtl";
  if (ltrRatio > 0.7) return "ltr";
  return "mixed";
}

export function detectParagraphDirection(text: string): "ltr" | "rtl" {
  const trimmed = text.trim();
  if (!trimmed) return "ltr";

  // Remove punctuation and whitespace; keep letters to count
  const cleaned = trimmed.replace(/\s|[0-9.,!?;:'"()\[\]{}<>@#$%^&*+=\-_\/\\|~`]/g, "");
  if (cleaned.length === 0) return "ltr";

  let rtlCount = 0;
  let ltrCount = 0;
  for (const ch of cleaned) {
    if (rtlChars.test(ch)) rtlCount++;
    else if (ltrChars.test(ch)) ltrCount++;
  }

  // If there's a dominant language, prefer it. If tied or both zero, fall back
  if (rtlCount > ltrCount) return "rtl";
  if (ltrCount > rtlCount) return "ltr";

  // Tie or no clear winner: fall back to first strong character as legacy behavior
  for (const char of trimmed) {
    if (rtlChars.test(char)) return "rtl";
    if (ltrChars.test(char)) return "ltr";
  }

  return "ltr";
}

export function getDirectionStyles(direction: "ltr" | "rtl"): {
  direction: "ltr" | "rtl";
  textAlign: "left" | "right";
} {
  return {
    direction,
    textAlign: direction === "rtl" ? "right" : "left",
  };
}

export function wrapParagraphsWithDirection(html: string, autoDirection: boolean): string {
  if (!autoDirection) return html;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const blockElements = tempDiv.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote");

  blockElements.forEach((element) => {
    const text = element.textContent || "";
    const direction = detectParagraphDirection(text);
    (element as HTMLElement).setAttribute('dir', direction);
    (element as HTMLElement).style.direction = direction;
    (element as HTMLElement).style.textAlign = direction === "rtl" ? "right" : "left";
  });

  return tempDiv.innerHTML;
}

export function extractHeadings(content: string): Array<{
  id: string;
  text: string;
  level: number;
  line: number;
}> {
  const headings: Array<{
    id: string;
    text: string;
    level: number;
    line: number;
  }> = [];

  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text, index + 1);

      headings.push({
        id: id,
        text,
        level,
        line: index + 1,
      });
    }
  });

  return headings;
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~`>\-|]/g, "")
    .trim();

  const words = cleanText.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

export function countCharacters(text: string): number {
  return text.length;
}