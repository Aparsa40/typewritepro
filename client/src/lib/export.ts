/**
 * Export Utilities - تولید Markdown، HTML، و PDF از محتوای صفحه
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { extractHeadings } from "./direction";

export interface ExportOptions {
  title?: string;
  author?: string;
  date?: Date;
  lineHeight?: number;
  fontFamily?: string;
}

/**
 * Export به Markdown (.md)
 */
export function exportToMarkdown(content: string, filename: string = "document.md"): void {
  // Prepend a generated table of contents (links use markdown ID anchors that will be translated in HTML)
  const headings = extractHeadings(content);
  const toc = generateTOCMarkdown(headings);
  const contentWithToc = toc ? `${toc}\n\n${content}` : content;
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/markdown;charset=utf-8," + encodeURIComponent(contentWithToc));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Export به HTML (.html)
 * شامل تمام فونت‌ها و استایل‌ها
 */
export function exportToHTML(content: string, htmlContent: string, filename: string = "document.html", options: ExportOptions = {}): void {
  // prepend a small table of contents HTML if headings are present
  const toc = generateTOCHTML(content);
  const htmlWithToc = (toc ? toc + htmlContent : htmlContent);

  const fullHTML = `<!DOCTYPE html>
<html lang="fa-IR" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${options.title || "Document"}</title>
  ${options.author ? `<meta name="author" content="${options.author}" />` : ""}
  ${options.date ? `<meta name="date" content="${options.date.toISOString()}" />` : ""}
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/iran-sans@1.0.2/dist/index.css" rel="stylesheet">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${options.fontFamily ? `'${options.fontFamily}', 'Vazirmatn', 'Inter', sans-serif` : "'Vazirmatn', 'Inter', sans-serif"};
      line-height: ${options.lineHeight ?? 1.6};
      color: #333;
      background: white;
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin: 1.5rem 0 1rem;
      line-height: 1.3;
      color: #000;
      font-weight: 600;
    }
    
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.75rem; }
    h4 { font-size: 1.5rem; }
    h5 { font-size: 1.25rem; }
    h6 { font-size: 1rem; }
    
    p {
      margin: 1rem 0;
      line-height: 1.8;
    }
    
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
    }
    
    pre {
      background: #f4f4f4;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      color: #333;
    }
    
    blockquote {
      border-right: 4px solid #007bff;
      padding-right: 1rem;
      margin: 1rem 0;
      color: #666;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    table th,
    table td {
      border: 1px solid #ddd;
      padding: 0.75rem;
      text-align: right;
    }
    
    table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-right: 2rem;
    }
    
    li {
      margin: 0.5rem 0;
    }
    
    a {
      color: #007bff;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    img {
      max-width: 100%;
      height: auto;
      margin: 1rem 0;
    }
    
    hr {
      margin: 2rem 0;
      border: none;
      border-top: 2px solid #ddd;
    }
    
    /* Farsi-specific styles */
    body {
      direction: rtl;
      text-align: right;
    }
    
    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="content">
    ${htmlWithToc}
  </div>
</body>
</html>`;

  const element = document.createElement("a");
  element.setAttribute("href", "data:text/html;charset=utf-8," + encodeURIComponent(fullHTML));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Export به PDF (.pdf)
 * استفاده از html2canvas + jsPDF
 */
export async function exportToPDF(htmlContent: string, filename: string = "document.pdf", options: ExportOptions = {}): Promise<void> {
  try {
    // ایجاد div موقتی برای render کردن HTML
    // Make sure PDF includes a table of contents if the content includes heading IDs
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    tempDiv.style.width = "800px";
    tempDiv.style.direction = "rtl";
    tempDiv.style.textAlign = "right";
    tempDiv.style.padding = "40px";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.fontFamily = options.fontFamily ? `${options.fontFamily}, 'Vazirmatn', 'Inter', sans-serif` : "'Vazirmatn', 'Inter', sans-serif";
    tempDiv.style.lineHeight = String(options.lineHeight ?? 1.6);
    document.body.appendChild(tempDiv);

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add metadata
    if (options.title) pdf.setProperties({ title: options.title });
    if (options.author) pdf.setProperties({ author: options.author });

    // Add image to PDF with pagination
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);

    // Clean up
    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error("PDF export error:", error);
    throw new Error("Failed to export PDF");
  }
}

function generateTOCMarkdown(headings: Array<{ id: string; text: string; level: number; line: number }>) {
  if (!headings || headings.length === 0) return "";
  let md = `## Table of Contents\n\n`;
  headings.forEach((h) => {
    const indent = '  '.repeat(Math.max(0, h.level - 1));
    md += `${indent}- [${h.text}](#${h.id})\n`;
  });
  return md;
}

function generateTOCHTML(content: string) {
  const headings = extractHeadings(content);
  if (!headings || headings.length === 0) return "";
  let html = `<nav class=\"toc\" aria-label=\"Table of contents\"><h2>Table of Contents</h2><ul>`;
  const stack: number[] = [];
  headings.forEach((h) => {
    html += `<li class=\"toc-level-${h.level}\"><a href=\"#${h.id}\">${h.text}</a></li>`;
  });
  html += `</ul></nav>`;
  return html;
}

/**
 * Export همه فرمت‌ها با یک فایل
 */
export async function exportAll(
  content: string,
  htmlContent: string,
  baseName: string = "document",
  options: ExportOptions = {}
): Promise<void> {
  try {
    // Export Markdown
    exportToMarkdown(content, `${baseName}.md`);

    // Export HTML
    exportToHTML(content, htmlContent, `${baseName}.html`, options);

    // Export PDF
    await exportToPDF(htmlContent, `${baseName}.pdf`, options);
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
}
