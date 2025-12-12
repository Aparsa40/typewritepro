import { z } from "zod";

export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  savePath: z.string().optional(),
});

export const insertDocumentSchema = documentSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export const editorSettingsSchema = z.object({
  fontFamily: z.string().default("JetBrains Mono"),
  fontSize: z.number().min(10).max(32).default(16),
  lineHeight: z.number().min(1).max(3).default(1.6),
  wordWrap: z.boolean().default(true),
  autoDirection: z.boolean().default(true),
  showLineNumbers: z.boolean().default(true),
  showMinimap: z.boolean().default(false),
  tabSize: z.number().min(2).max(8).default(2),
});

export type EditorSettings = z.infer<typeof editorSettingsSchema>;

export const themeSchema = z.enum(["light", "dark", "ocean", "sepia", "aurora", "dark-blue", "midnight", "deep-blue", "plum"]);
export type Theme = z.infer<typeof themeSchema>;

export const exportFormatSchema = z.enum(["pdf", "html", "markdown"]);
export type ExportFormat = z.infer<typeof exportFormatSchema>;

export const headingSchema = z.object({
  id: z.string(),
  text: z.string(),
  level: z.number().min(1).max(6),
  line: z.number(),
});

export type Heading = z.infer<typeof headingSchema>;

export const appStateSchema = z.object({
  currentDocument: documentSchema.nullable(),
  theme: themeSchema,
  settings: editorSettingsSchema,
  showSidebar: z.boolean(),
  showPreview: z.boolean(),
  showSettings: z.boolean(),
});

export type AppState = z.infer<typeof appStateSchema>;

export const defaultSettings: EditorSettings = {
  fontFamily: "JetBrains Mono",
  fontSize: 16,
  lineHeight: 1.6,
  wordWrap: true,
  autoDirection: true,
  showLineNumbers: true,
  showMinimap: false,
  tabSize: 2,
};

export const fontFamilies = [
  { value: "JetBrains Mono", label: "JetBrains Mono", type: "mono" },
  { value: "Vazirmatn", label: "Vazirmatn (فارسی)", type: "farsi" },
  { value: "Inter", label: "Inter", type: "sans" },
  { value: "Fira Code", label: "Fira Code", type: "mono" },
  { value: "Source Code Pro", label: "Source Code Pro", type: "mono" },
  { value: "IBM Plex Mono", label: "IBM Plex Mono", type: "mono" },
  { value: "Roboto Mono", label: "Roboto Mono", type: "mono" },
] as const;
