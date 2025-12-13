export function generateHeadingId(text: string, line: number): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `heading-${line}-${slug}`;
}
