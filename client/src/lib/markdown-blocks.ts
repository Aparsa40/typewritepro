/**
 * Markdown Blocks Generator - تولید بلوک‌های Markdown و HTML برای ابزارهای Markdown Helper
 */

export interface HeadingConfig {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export function generateHeading(config: HeadingConfig): string {
  const hashes = "#".repeat(config.level);
  return `${hashes} ${config.text}\n\n`;
}

export interface FooterConfig {
  text: string;
  pageNumber: boolean;
  align: "left" | "center" | "right";
  fontSize: number;
  color: string;
  fontFamily: string;
}

export function generateFooter(config: FooterConfig): string {
  const alignMap = { left: "flex-start", center: "center", right: "flex-end" };
  const pageText = config.pageNumber ? " - صفحه {page}" : "";
  return `<footer style="display: flex; justify-content: ${alignMap[config.align]}; font-size: ${config.fontSize}px; color: ${config.color}; font-family: ${config.fontFamily}; padding: 1rem; margin-top: 2rem; border-top: 1px solid #ccc;">
  ${config.text}${pageText}
</footer>\n\n`;
}

export interface BoxConfig {
  content: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
  textAlign: "left" | "center" | "right";
}

export function generateBox(config: BoxConfig): string {
  const alignMap = { left: "flex-start", center: "center", right: "flex-end" };
  return `<div style="background-color: ${config.backgroundColor}; color: ${config.textColor}; font-size: ${config.fontSize}px; font-family: ${config.fontFamily}; border: ${config.borderWidth}px solid ${config.borderColor}; border-radius: ${config.borderRadius}px; padding: ${config.padding}px; text-align: ${config.textAlign}; line-height: 1.6;">
  ${config.content}
</div>\n\n`;
}

export interface TableConfig {
  rows: number;
  columns: number;
  headerBgColor: string;
  cellBgColor: string;
  borderColor: string;
  borderWidth: number;
  textAlign: "left" | "center" | "right";
  fontSize: number;
  fontFamily: string;
}

export function generateTable(config: TableConfig): string {
  const alignMap = { left: "left", center: "center", right: "right" };
  let table = `<table style="width: 100%; border-collapse: collapse; font-family: ${config.fontFamily}; font-size: ${config.fontSize}px;">\n`;

  // Header row
  table += `  <tr style="background-color: ${config.headerBgColor};">\n`;
  for (let i = 0; i < config.columns; i++) {
    table += `    <th style="border: ${config.borderWidth}px solid ${config.borderColor}; padding: 8px; text-align: ${alignMap[config.textAlign]};">عنوان ${i + 1}</th>\n`;
  }
  table += `  </tr>\n`;

  // Data rows
  for (let row = 0; row < config.rows; row++) {
    table += `  <tr style="background-color: ${config.cellBgColor};">\n`;
    for (let col = 0; col < config.columns; col++) {
      table += `    <td style="border: ${config.borderWidth}px solid ${config.borderColor}; padding: 8px; text-align: ${alignMap[config.textAlign]};">داده ${row + 1}-${col + 1}</td>\n`;
    }
    table += `  </tr>\n`;
  }

  table += `</table>\n\n`;
  return table;
}

export interface CodeConfig {
  language: string;
  code: string;
  fontSize: number;
  fontFamily: string;
}

export function generateCodeBlock(config: CodeConfig): string {
  return `\`\`\`${config.language}\n${config.code}\n\`\`\`\n\n`;
}

export interface ParagraphConfig {
  content: string;
  farsiFont: "Nazanin" | "Vazirmatn" | "IRANSans";
  englishFont: "Inter" | "JetBrains Mono" | "Monospace";
  fontSize: number;
  color: string;
  backgroundColor?: string;
  lineHeight: 1.5 | 1.8 | 2;
  letterSpacing: number; // in pixels
  textAlign: "left" | "right" | "center" | "justify";
}

export function generateParagraph(config: ParagraphConfig): string {
  // Map font names to CSS font-family
  const fontFamilyMap = {
    Nazanin: "'B Nazanin', serif",
    Vazirmatn: "'Vazirmatn', sans-serif",
    IRANSans: "'Iran Sans', sans-serif",
    Inter: "'Inter', sans-serif",
    "JetBrains Mono": "'JetBrains Mono', monospace",
    Monospace: "monospace"
  };

  const farsiFamily = fontFamilyMap[config.farsiFont];
  const englishFamily = fontFamilyMap[config.englishFont];

  // Use both fonts (primary farsi, fallback to english)
  const combinedFontFamily = `${farsiFamily}, ${englishFamily}`;

  const bgStyle = config.backgroundColor ? `background-color: ${config.backgroundColor};` : "";
  const paddingStyle = config.backgroundColor ? "padding: 1rem;" : "";

  return `<p dir="auto" style="font-family: ${combinedFontFamily}; font-size: ${config.fontSize}px; color: ${config.color}; line-height: ${config.lineHeight}; letter-spacing: ${config.letterSpacing}px; text-align: ${config.textAlign}; ${bgStyle} ${paddingStyle} margin: 1rem 0;">
  ${config.content}
</p>\n\n`;
}

export interface HeaderTemplateConfig {
  title: string;
  subject?: string;
  date?: string;
  titleFont: string;
  metaFont: string;
  titleSize: number;
  metaSize: number;
  titleColor: string;
}

export function generateHeaderTemplate(config: HeaderTemplateConfig): string {
  return `<header dir="auto" style="padding: 1rem 0; margin-bottom: 1rem;">
  <h1 style="font-family: ${config.titleFont}; font-size: ${config.titleSize}px; color: ${config.titleColor}; margin: 0 0 0.5rem;">${config.title}</h1>
  <div style="font-family: ${config.metaFont}; font-size: ${config.metaSize}px; color: #666; display: flex; gap: 1rem;">${config.subject ? `<span>${config.subject}</span>` : ''}${config.date ? `<span>${config.date}</span>` : ''}</div>
</header>\n\n`;
}

export interface BorderConfig {
  borderStyle: 'solid' | 'dashed' | 'double';
  color: string;
  width: number;
  radius: number;
  padding: number;
}

export function generateBorderWrapper(contentHtml: string, config: BorderConfig): string {
  return `<div style="border: ${config.width}px ${config.borderStyle} ${config.color}; border-radius: ${config.radius}px; padding: ${config.padding}px;">\n${contentHtml}\n</div>\n\n`;
}
