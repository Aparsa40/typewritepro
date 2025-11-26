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

export function renderMarkdown(content: string, autoDirection: boolean = true): string {
  if (!content) return "";
  
  try {
    const html = marked.parse(content) as string;
    
    if (autoDirection && typeof document !== "undefined") {
      return addDirectionToElements(html);
    }
    
    return html;
  } catch (error) {
    console.error("Markdown parsing error:", error);
    return `<p>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
  }
}

export function getMarkdownStyles(theme: "light" | "dark"): string {
  const isDark = theme === "dark";
  
  return `
    .markdown-preview {
      font-family: 'Inter', 'Vazirmatn', system-ui, sans-serif;
      line-height: 1.7;
      color: ${isDark ? "#e0e0e0" : "#1a1a1a"};
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
    
    .markdown-preview p {
      margin: 1em 0;
    }
    
    .markdown-preview a {
      color: ${isDark ? "#60a5fa" : "#2563eb"};
      text-decoration: none;
    }
    
    .markdown-preview a:hover {
      text-decoration: underline;
    }
    
    .markdown-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.875em;
      background: ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
      padding: 0.2em 0.4em;
      border-radius: 4px;
    }
    
    .markdown-preview pre {
      background: ${isDark ? "#1e1e1e" : "#f6f8fa"};
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
    }
    
    .markdown-preview pre code {
      background: transparent;
      padding: 0;
    }
    
    .markdown-preview blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"};
      border-radius: 4px;
    }
    
    .markdown-preview ul,
    .markdown-preview ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    .markdown-preview li {
      margin: 0.25em 0;
    }
    
    .markdown-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    
    .markdown-preview th,
    .markdown-preview td {
      border: 1px solid ${isDark ? "#3e3e42" : "#e0e0e0"};
      padding: 0.5em 1em;
      text-align: left;
    }
    
    .markdown-preview th {
      background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"};
      font-weight: 600;
    }
    
    .markdown-preview tr:nth-child(even) {
      background: ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"};
    }
    
    .markdown-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    .markdown-preview hr {
      border: none;
      border-top: 1px solid ${isDark ? "#3e3e42" : "#e0e0e0"};
      margin: 2em 0;
    }
    
    .markdown-preview strong {
      font-weight: 600;
    }
    
    .markdown-preview em {
      font-style: italic;
    }
  `;
}
