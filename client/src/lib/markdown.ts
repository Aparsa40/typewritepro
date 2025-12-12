import { marked } from "marked";
import { detectParagraphDirection } from "./direction";

marked.setOptions({
  gfm: true,
  breaks: true,
});

function addDirectionToElements(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const blockElements = tempDiv.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote");

  blockElements.forEach((element) => {
    const text = element.textContent || "";
    const direction = detectParagraphDirection(text);
    const htmlEl = element as HTMLElement;
    htmlEl.style.direction = direction;
    htmlEl.style.textAlign = direction === "rtl" ? "right" : "left";

    if (element.tagName === "BLOCKQUOTE") {
      if (direction === "rtl") {
        htmlEl.style.borderRight = "4px solid hsl(217, 91%, 60%)";
        htmlEl.style.borderLeft = "none";
        htmlEl.style.paddingRight = "1rem";
        htmlEl.style.paddingLeft = "0.5em";
      } else {
        htmlEl.style.borderLeft = "4px solid hsl(217, 91%, 60%)";
        htmlEl.style.borderRight = "none";
        htmlEl.style.paddingLeft = "1rem";
        htmlEl.style.paddingRight = "0.5em";
      }
    }
  });

  return tempDiv.innerHTML;
}

function addDirectionToPlainText(text: string): string {
  if (!text || typeof document === "undefined") return text;

  // Split into paragraphs by empty lines and wrap each paragraph with its own direction
  const paragraphs = text.split(/\n{2,}/g);

  const wrapped = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      const direction = detectParagraphDirection(trimmed);
      const escaped = trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      return `<p dir="${direction}" style="direction: ${direction}; text-align: ${direction === "rtl" ? "right" : "left"}; white-space: pre-wrap; word-break: break-word; margin: 0 0 1rem 0;">${escaped}</p>`;
    })
    .join("\n");

  return `<div class=\"markdown-preview\">${wrapped}</div>`;
}

// Helper function to extract URL from markdown image syntax
function extractUrl(mdImage: string): string {
  const m = mdImage.match(/\(([^)]+)\)/);
  if (!m) return '';
  let inside = m[1].trim();
  // handle <...> urls
  if (inside.startsWith('<')) {
    const end = inside.indexOf('>');
    if (end !== -1) return inside.slice(1, end);
  }
  // otherwise split by whitespace to separate optional title
  const parts = inside.split(/\s+/);
  return parts[0];
}

export function renderMarkdown(content: string, autoDirection: boolean = true): string {
  if (!content) return "";

  try {
    // Check if content appears to contain markdown structures (headings, lists, code fences, links, blockquotes)
    const hasMarkdown = /(^#{1,6}\s)|(^\s*[-*+]\s)|(^\s*\d+\.\s)|(```)|(`[^`]+`)|(\[[^\]]+\]\([^\)]+\))|(^>\s)|(^-{3,}\s*$)/m.test(content);
    if (!hasMarkdown && autoDirection && typeof document !== "undefined") {
      // Plain text without markdown - apply per-paragraph direction detection
      return addDirectionToPlainText(content);
    }

    // Preprocess markdown image syntax into HTML placeholders with IDs so the preview can map
    // markdown image occurrences to DOM nodes for editing.
    let counter = 0;
    const mdImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;

    const preprocessed = content.replace(mdImageRegex, (match) => {
      counter += 1;
      const id = `img-${counter}`;
      const url = extractUrl(match).replace(/^<|>$/g, "");
      const encoded = encodeURIComponent(match);
      // Render an HTML img element directly (marked will pass HTML through) and attach a comment
      // containing the original markdown so we can find and replace the exact snippet later.
      return `<img src="${url}" data-image-id="${id}" /><!--MD:${encoded}-->`;
    });

    // Parse markdown with marked (preprocessed HTML placeholders will be preserved)
    const html = marked.parse(preprocessed) as string;

    // For plain text lines in markdown content, each <p> will get direction applied
    if (autoDirection && typeof document !== "undefined") {
      return addDirectionToElements(html);
    }

    return html;
  } catch (error) {
    console.error("Markdown parsing error:", error);
    if (autoDirection && typeof document !== "undefined") {
      return addDirectionToPlainText(content);
    }
    return `<p>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
  }
}

export function getMarkdownStyles(_theme?: string): string {
  // Use CSS variables defined on :root / theme classes so preview follows applied theme
  return `
    .markdown-preview {
      font-family: var(--font-sans, 'Inter'), 'Vazirmatn', system-ui, sans-serif;
      line-height: 1.7;
      color: hsl(var(--foreground));
      box-sizing: border-box;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      padding: 0 0.5rem;
      max-width: 100%;
      background: transparent;
    }

    .markdown-preview h1,
    .markdown-preview h2,
    .markdown-preview h3,
    .markdown-preview h4,
    .markdown-preview h5,
    .markdown-preview h6 {
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      line-height: 1.3;
    }

    .markdown-preview h1 { font-size: 2rem; }
    .markdown-preview h2 { font-size: 1.5rem; }
    .markdown-preview h3 { font-size: 1.25rem; }
    .markdown-preview h4 { font-size: 1.125rem; }
    .markdown-preview h5 { font-size: 1rem; }
    .markdown-preview h6 { font-size: 0.875rem; }

    .markdown-preview p { margin: 1em 0; }

    .markdown-preview a { color: hsl(var(--primary)); text-decoration: none; }
    .markdown-preview a:hover { text-decoration: underline; }

    .markdown-preview code {
      font-family: var(--font-mono, 'JetBrains Mono');
      font-size: 0.875em;
      background: rgba(0,0,0,0.04);
      padding: 0.2em 0.4em;
      border-radius: 4px;
    }

    .markdown-preview pre {
      background: hsl(var(--card));
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
      color: hsl(var(--card-foreground, var(--foreground)));
    }

    .markdown-preview pre code { background: transparent; padding: 0; }

    .markdown-preview blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      background: rgba(0,0,0,0.03);
      border-radius: 4px;
    }

    .markdown-preview ul, .markdown-preview ol { margin: 1em 0; padding-left: 2em; }
    .markdown-preview li { margin: 0.25em 0; }

    .markdown-preview table { width: 100%; border-collapse: collapse; margin: 1em 0; }
    .markdown-preview th, .markdown-preview td {
      border: 1px solid hsl(var(--border));
      padding: 0.5em 1em;
      text-align: left;
    }
    .markdown-preview th { background: rgba(0,0,0,0.03); font-weight: 600; }
    .markdown-preview tr:nth-child(even) { background: rgba(0,0,0,0.01); }

    .markdown-preview img { max-width: 100%; height: auto; border-radius: 8px; }
    .markdown-preview hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 2em 0; }
    .markdown-preview strong { font-weight: 600; }
    .markdown-preview em { font-style: italic; }
  `;
}
