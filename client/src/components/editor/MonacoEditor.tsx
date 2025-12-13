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
    pageSettings,
  } = useEditorStore();

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Add paste event listener to support context-menu Paste
    const editorDom = editor.getDomNode();
    if (editorDom) {
      // Handle paste events from both keyboard and context menu reliably by
      // watching for paste events on the document in the capture phase and
      // ensuring the active element is inside the editor.
        const handlePaste = (e: ClipboardEvent) => {
        // Only intercept paste events that are targeted to the editor
        const activeEl = document.activeElement as Node | null;
        // When right-click paste is used, focus might not be on the editor; try checking monaco focus as well
        const isEditorFocused = editor?.hasTextFocus?.() || false;
        if (!isEditorFocused && (!activeEl || !editorDom.contains(activeEl))) return;
        e.preventDefault();
        try {
          // Prefer the clipboardData from the event (works with context menu paste)
          const text = e.clipboardData?.getData("text/plain") || "";
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
          // Fallback: attempt to read via deprecated clipboard API if available
          (async () => {
            try {
              const cbText = await navigator.clipboard.readText();
              if (cbText && editor) {
                const selection = editor.getSelection();
                if (selection) {
                  editor.executeEdits("paste-event", [
                    { range: selection, text: cbText, forceMoveMarkers: true },
                  ]);
                }
              }
            } catch (err2) {
              console.warn("Clipboard paste failed:", err2);
            }
          })();
        }
      };
      // Capture phase ensures we receive paste events even if Monaco stops propagation
      document.addEventListener('paste', handlePaste, true);
      // Also ensure right-click contextmenu focuses the editor so 'Paste' works
      const handleContextMenu = (ev: Event) => { try { editor.focus(); } catch { } };
      editorDom.addEventListener('contextmenu', handleContextMenu, true);
      // Cleanup on unmount
      const clear = () => {
        document.removeEventListener('paste', handlePaste, true);
        editorDom.removeEventListener('contextmenu', handleContextMenu, true);
      };
      // Attach to the editor so we can remove when it's disposed
      editor.onDidDispose(clear);
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

    // On context menu open, ensure the editor is focused so subsequent context-menu 'Paste' events target it
    if ((editor as any).onContextMenu) {
      editor.onContextMenu(() => {
        try { editor.focus(); } catch (err) { /* ignore */ }
      });
    }

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

  const goToLine = useCallback((line: number, column?: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: column ?? 1 });
      editorRef.current.focus();
    }
  }, []);

  useEffect(() => { (window as any).goToEditorLine = goToLine; (window as any).goToEditorPosition = goToLine; }, [goToLine]);

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
    <div className="h-full w-full" data-testid="monaco-editor-container" style={{ overflowX: 'auto', padding: '0.5rem', boxSizing: 'border-box' }}>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={(["dark","dark-blue","midnight","deep-blue","plum","aurora"].includes(theme) ? "typewriter-dark" : "typewriter-light")}
        options={{
          fontFamily: `${pageSettings?.fontFamily ?? settings.fontFamily}, 'Vazirmatn', 'JetBrains Mono', monospace`,
          // If page settings specify a font, prefer that (per-page presentation), otherwise global settings
          fontSize: pageSettings?.fontSize ?? settings.fontSize,
          // Use workspace/page specific line spacing where provided, otherwise fall back to global settings
          lineHeight: (pageSettings?.lineSpacing ?? settings.lineHeight) * (pageSettings?.fontSize ?? settings.fontSize),
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
