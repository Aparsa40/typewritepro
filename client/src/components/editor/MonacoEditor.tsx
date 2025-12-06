import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useEditorStore } from "@/lib/store";
import { detectTextDirection, countWords, countCharacters, extractHeadings } from "@/lib/direction";

export function MonacoEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const {
    content,
    setContent,
    theme,
    settings,
    setCursorPosition,
    setScrollPosition,
    setWordCount,
    setCharCount,
    setDetectedDirection,
    setHeadings,
    scrollPosition,
  } = useEditorStore();

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Add paste event listener to support context-menu Paste
    const editorDom = editor.getDomNode();
    if (editorDom) {
      const handlePaste = async (e: ClipboardEvent) => {
        e.preventDefault();
        try {
          const text = await navigator.clipboard.readText();
          if (text && editor) {
            const selection = editor.getSelection();
            if (selection) {
              editor.executeEdits("paste-event", [
                {
                  range: selection,
                  text,
                  forceMoveMarkers: true,
                },
              ]);
            }
          }
        } catch (err) {
          console.warn("Clipboard paste failed:", err);
        }
      };
      editorDom.addEventListener('paste', handlePaste);
    }

    // Set editor container to dir='auto' for per-paragraph RTL/LTR handling
    const dom = editor.getDomNode();
    if (dom) {
      dom.setAttribute('dir', 'auto');
      (dom as HTMLElement).style.textAlign = 'start';
    }

    // تعریف تم‌ها
    monaco.editor.defineTheme("typewriter-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "heading", foreground: "2563eb", fontStyle: "bold" },
        { token: "emphasis", fontStyle: "italic" },
        { token: "strong", fontStyle: "bold" },
        { token: "keyword.md", foreground: "2563eb" },
        { token: "string.link.md", foreground: "2563eb" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#1a1a1a",
        "editor.lineHighlightBackground": "#f8f9fa",
        "editorLineNumber.foreground": "#6b7280",
        "editorLineNumber.activeForeground": "#1a1a1a",
        "editor.selectionBackground": "#dbeafe",
        "editorCursor.foreground": "#2563eb",
        "editor.inactiveSelectionBackground": "#e5e7eb",
      },
    });

    monaco.editor.defineTheme("typewriter-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "heading", foreground: "60a5fa", fontStyle: "bold" },
        { token: "emphasis", fontStyle: "italic" },
        { token: "strong", fontStyle: "bold" },
        { token: "keyword.md", foreground: "60a5fa" },
        { token: "string.link.md", foreground: "60a5fa" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#e0e0e0",
        "editor.lineHighlightBackground": "#252526",
        "editorLineNumber.foreground": "#6b7280",
        "editorLineNumber.activeForeground": "#e0e0e0",
        "editor.selectionBackground": "#264f78",
        "editorCursor.foreground": "#3b82f6",
        "editor.inactiveSelectionBackground": "#3e3e42",
      },
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });

    const isSyncingFromPreview = { current: false };
    editor.onDidScrollChange(() => {
      if (!editorRef.current) return;
      const scrollTop = editorRef.current.getScrollTop();
      const scrollHeight = editorRef.current.getScrollHeight();
      const clientHeight = editorRef.current.getLayoutInfo().height;
      const scrollPercent = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
      if ((editor as any).__isSyncingFromPreview) {
        (editor as any).__isSyncingFromPreview = false;
        return;
      }
      setScrollPosition("editor", scrollPercent);
    });

    editor.focus();
  }, [setCursorPosition, setScrollPosition]);

  const handleChange: OnChange = useCallback(
    (value) => {
      const newContent = value || "";
      setContent(newContent);

      // Update overall document direction for status display
      setDetectedDirection(detectTextDirection(newContent));
      setWordCount(countWords(newContent));
      setCharCount(countCharacters(newContent));
      setHeadings(extractHeadings(newContent));
    },
    [setContent, setDetectedDirection, setWordCount, setCharCount, setHeadings]
  );

  useEffect(() => {
    // Initialize direction detection on mount
    setDetectedDirection(detectTextDirection(content));
    setWordCount(countWords(content));
    setCharCount(countCharacters(content));
    setHeadings(extractHeadings(content));
  }, []);

  const goToLine = useCallback((line: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: 1 });
      editorRef.current.focus();
    }
  }, []);

  useEffect(() => { (window as any).goToEditorLine = goToLine; }, [goToLine]);

  const insertText = useCallback((text: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      if (selection) {
        editorRef.current.executeEdits("insert-text", [{ range: selection, text, forceMoveMarkers: true }]);
        editorRef.current.focus();
      }
    }
  }, []);

  useEffect(() => { (window as any).insertTextAtCursor = insertText; }, [insertText]);

  useEffect(() => {
    if (!editorRef.current || !scrollPosition) return;
    const previewPercent = scrollPosition.preview ?? 0;
    const scrollHeight = editorRef.current.getScrollHeight();
    const clientHeight = editorRef.current.getLayoutInfo().height;
    const top = scrollHeight > clientHeight ? (previewPercent / 100) * (scrollHeight - clientHeight) : 0;
    (editorRef.current as any).__isSyncingFromPreview = true;
    editorRef.current.setScrollTop(top);
  }, [scrollPosition?.preview]);

  return (
    <div className="h-full w-full" data-testid="monaco-editor-container">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme === "dark" ? "typewriter-dark" : "typewriter-light"}
        options={{
          fontFamily: `'${settings.fontFamily}', 'Vazirmatn', 'JetBrains Mono', monospace`,
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight * settings.fontSize,
          wordWrap: settings.wordWrap ? "on" : "off",
          lineNumbers: settings.showLineNumbers ? "on" : "off",
          minimap: { enabled: settings.showMinimap },
          tabSize: settings.tabSize,
          scrollBeyondLastLine: false,
          renderWhitespace: "selection",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          folding: true,
          foldingHighlight: true,
          links: true,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          wordBasedSuggestions: "off",
          contextmenu: true,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}
