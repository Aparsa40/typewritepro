import { marked } from "marked";
import { generateHeadingId } from "./slug";
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
    htmlEl.setAttribute('dir', direction);
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

  // Split into paragraphs by line breaks (one or more newlines) and wrap each paragraph with its own direction
  // This ensures mixed lines get appropriate per-line direction without requiring an empty line between English and Persian
  const paragraphs = text.split(/\n+/g);

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

// Simple local wrapper counter (avoids new dependency)
let _wrapperCounter = 0;
function nextWrapperId(line: number, idx: number) {
  _wrapperCounter += 1;
  return `wr-${line}-${idx}-${_wrapperCounter}`;
}

// Compute LCS-based mapping from rendered text chars to source text chars (zero-based indices)
function computeLcsMapping(source: string, rendered: string): number[] {
  const m = source.length;
  const n = rendered.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (source[i] === rendered[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const mapping: number[] = new Array(n).fill(-1);
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (source[i] === rendered[j]) {
      mapping[j] = i;
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  let last = -1;
  for (let k = 0; k < mapping.length; k++) {
    if (mapping[k] !== -1) last = mapping[k];
    else if (last >= 0) mapping[k] = Math.min(source.length - 1, last + 1), last = mapping[k];
    else mapping[k] = 0;
  }
  return mapping;
}

function annotateDomWithCharWrappers(container: HTMLElement, sourceLine: string, lineNumber: number, charMap: Record<string, number[]>) {
  // gather text nodes in order
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];
  let tn = walker.nextNode() as Text | null;
  while (tn) {
    if (tn.nodeValue && tn.nodeValue.length > 0) textNodes.push(tn);
    tn = walker.nextNode() as Text | null;
  }
  const renderedStr = textNodes.map(t => t.nodeValue || '').join('');
  const mapping = computeLcsMapping(sourceLine, renderedStr);
  let idx = 0;
  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const t = node.nodeValue || '';
    if (t.length === 0) continue;
    const arr: number[] = [];
    for (let k = 0; k < t.length; k++) arr.push(mapping[idx + k]);
    idx += t.length;
    const wrapperId = nextWrapperId(lineNumber, i);
    const span = document.createElement('span');
    span.setAttribute('data-char-wrapper', wrapperId);
    span.setAttribute('data-source-line', String(lineNumber));
    const parent = node.parentNode;
    if (parent) {
      parent.replaceChild(span, node);
      span.appendChild(node);
      charMap[wrapperId] = arr;
    }
  }
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

    // Insert invisible anchors for each source line (used to map cursor positions)
    // Avoid inserting anchors inside fenced code blocks so we don't break code rendering
    const lines = content.split('\n');
    let inFence = false;
    const withAnchors = lines
      .map((ln, idx) => {
        const fenceMatch = ln.match(/^\s*```/);
        if (fenceMatch) inFence = !inFence;
        if (inFence) return ln; // do not inject inside code fences
        // anchor uses an HTML element that will be present in the DOM and allows for exact mapping
        return `<span data-source-line="${idx + 1}" class="md-line-anchor" aria-hidden="true"></span>${ln}`;
      })
      .join('\n');

    const preprocessed = withAnchors.replace(mdImageRegex, (match) => {
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

    // Assign deterministic ids to headings and annotate text nodes with exact char->source mapping
    if (typeof document !== "undefined") {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const charMap: Record<string, number[]> = {};
      const linesArr = content.split('\n');

      // process anchors and annotate the subsequent inline content until the next anchor
      const anchors = tmp.querySelectorAll('span.md-line-anchor');
      anchors.forEach((anchor) => {
        const attr = anchor.getAttribute('data-source-line');
        const lineNum = attr ? parseInt(attr, 10) : 0;
        if (!lineNum) return;
        const parent = anchor.parentElement;
        if (!parent) return;
        // gather nodes belonging to this anchor's line (until next anchor in the DOM)
        const nodes: Node[] = [];
        let node = anchor.nextSibling;
        while (node) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).querySelector && (node as Element).querySelector('[data-source-line]')) {
            break;
          }
          nodes.push(node);
          node = node.nextSibling;
        }
        if (nodes.length === 0) return;
        // create a temporary container and move nodes into it for processing
        const container = document.createElement('div');
        nodes.forEach((n) => container.appendChild(n));
        const sourceLine = linesArr[lineNum - 1] || '';
        annotateDomWithCharWrappers(container as HTMLElement, sourceLine, lineNum, charMap);
        // move annotated nodes back into parent at anchor position
        let c = container.firstChild;
        while (c) {
          parent.insertBefore(c, anchor.nextSibling);
          c = container.firstChild;
        }
      });

      // deterministic heading ids
      const headings = tmp.querySelectorAll('h1,h2,h3,h4,h5,h6');
      headings.forEach((h) => {
        const anchor = h.querySelector('[data-source-line]') || (h.previousElementSibling && (h.previousElementSibling.getAttribute('data-source-line') ? h.previousElementSibling : null));
        let line = 0;
        if (anchor && (anchor as Element).getAttribute) line = parseInt((anchor as Element).getAttribute('data-source-line') || '0') || 0;
        if (line) {
          const id = generateHeadingId(h.textContent || 'heading', line);
          h.setAttribute('id', id);
        }
      });

      // Annotate table cells with source line and cell index/range to assist click-to-caret mapping
      const tables = tmp.querySelectorAll('table');
      tables.forEach((table) => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, rowIndex) => {
          // attempt to find a wrapper that indicates the source line
          const wrapper = row.querySelector('[data-char-wrapper]') as HTMLElement | null;
          let lineNum = 0;
          if (wrapper && wrapper.hasAttribute('data-source-line')) {
            lineNum = parseInt(wrapper.getAttribute('data-source-line') || '0', 10);
          } else {
            // fallback: find preceding anchor within the row's previous siblings
            let el: Element | null = row.previousElementSibling;
            while (el && !el.querySelector) el = el.previousElementSibling;
            const anchor = el ? el.querySelector('[data-source-line]') : null;
            if (anchor) lineNum = parseInt((anchor as Element).getAttribute('data-source-line') || '0', 10);
          }

          const sourceLine = lineNum ? linesArr[lineNum - 1] || '' : '';
          const offsets = getTableCellOffsets(sourceLine);
          const cells = row.querySelectorAll('td,th');
          cells.forEach((cell, i) => {
            cell.setAttribute('data-table-cell-index', String(i));
            if (lineNum) cell.setAttribute('data-table-source-line', String(lineNum));
            if (offsets && i < offsets.length) {
              const r = offsets[i];
              cell.setAttribute('data-table-cell-range', `${r.start}:${r.end}`);
            }
          });
        });
      });

      const withDir = autoDirection ? addDirectionToElements(tmp.innerHTML) : tmp.innerHTML;
      // append a tiny script that exposes the mapping so the preview click handler can convert offsets
      const mapScript = `<script type="application/json" id="typewriter-char-map">${JSON.stringify(charMap)}</script>`;
      return withDir + mapScript;
    }

    // For plain environments (no DOM), fall back to original HTML
    if (autoDirection && typeof document === "undefined") {
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

/**
 * Compute indices (start/end) for each markdown table cell on a single source line.
 * This attempts to ignore pipes inside inline code fences/backticks.
 */
export function getTableCellOffsets(line: string): Array<{ start: number; end: number }> {
  const offsets: Array<{ start: number; end: number }> = [];
  if (!line) return offsets;

  let inBacktick = false;
  let lastIdx = 0;
  const appendCell = (from: number, to: number) => { offsets.push({ start: from, end: to }); };

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '`') {
      inBacktick = !inBacktick;
      continue;
    }
    if (!inBacktick && ch === '|') {
      // cell boundary between lastIdx and i
      appendCell(lastIdx, i);
      lastIdx = i + 1;
    }
  }
  // trailing cell
  appendCell(lastIdx, line.length);
  // Trim whitespace-only cells by merging now - we still keep offsets but trimmed at edges
  return offsets.map(o => ({ start: o.start + (line.slice(o.start, o.end).match(/^\s*/)?.[0]?.length || 0), end: o.end - (line.slice(o.start, o.end).match(/\s*$/)?.[0]?.length || 0) }));
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
    .md-line-anchor { display: block; height: 0; line-height: 0; visibility: hidden; }
    .markdown-preview [data-char-wrapper] { display: inline; }

    .markdown-preview hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 2em 0; }
    .markdown-preview strong { font-weight: 600; }
    .markdown-preview em { font-style: italic; }
  `;
}
