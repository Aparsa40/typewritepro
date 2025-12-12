
import React, { useEffect, useState, useRef } from "react";

type Props = {
  previewRef: React.RefObject<HTMLElement>;
  content: string;
  setContent: (c: string) => void;
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const ImageEditorOverlay: React.FC<Props> = ({ previewRef, content, setContent }) => {
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [originalMarkdown, setOriginalMarkdown] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; origLeft: number; origTop: number } | null>(null);
  const resizeState = useRef<{ resizing: boolean; corner: string; startX: number; startY: number; origRect: any } | null>(null);

  // When an image is selected, compute its position relative to preview container in percentages
  const computeRectForImg = (img: HTMLImageElement) => {
    const container = previewRef.current as HTMLElement | null;
    if (!container) return null;
    const cRect = container.getBoundingClientRect();
    const iRect = img.getBoundingClientRect();
    const left = ((iRect.left - cRect.left) / cRect.width) * 100;
    const top = ((iRect.top - cRect.top) / cRect.height) * 100;
    const width = (iRect.width / cRect.width) * 100;
    const height = (iRect.height / cRect.height) * 100;
    return { left, top, width, height };
  };

  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target.closest("img") as HTMLImageElement | null;
      if (!img || !container.contains(img)) {
        setSelectedSrc(null);
        setRect(null);
        setOriginalMarkdown(null);
        setShowToolbar(false);
        return;
      }

      // select this image
      setSelectedSrc(img.src);
      const r = computeRectForImg(img);
      setRect(r);
      // attempt to read the original markdown from an adjacent comment node
      let origMd: string | null = null;
      const next = img.nextSibling as ChildNode | null;
      if (next && next.nodeType === 8) { // comment node
        const v = (next as Comment).nodeValue || "";
        if (v.startsWith("MD:")) {
          try {
            origMd = decodeURIComponent(v.slice(3));
          } catch (e) {
            origMd = v.slice(3);
          }
        }
      }
      setOriginalMarkdown(origMd);
      setShowToolbar(true);
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [previewRef]);

  // Mouse handlers for dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragState.current?.dragging && rect) {
        const { startX, startY, origLeft, origTop } = dragState.current;
        const container = previewRef.current as HTMLElement;
        if (!container) return;
        const cRect = container.getBoundingClientRect();
        const dx = ((e.clientX - startX) / cRect.width) * 100;
        const dy = ((e.clientY - startY) / cRect.height) * 100;
        const newLeft = Math.max(0, Math.min(100 - rect.width, origLeft + dx));
        const newTop = Math.max(0, Math.min(100 - rect.height, origTop + dy));
        setRect({ ...rect, left: newLeft, top: newTop });
      }

      if (resizeState.current?.resizing && rect) {
        const { startX, startY, origRect, corner } = resizeState.current;
        const container = previewRef.current as HTMLElement;
        if (!container) return;
        const cRect = container.getBoundingClientRect();
        const dx = ((e.clientX - startX) / cRect.width) * 100;
        const dy = ((e.clientY - startY) / cRect.height) * 100;
        let newRect = { ...origRect };
        // simple corner logic: nw, ne, sw, se
        if (corner === "se") {
          newRect.width = Math.max(1, origRect.width + dx);
          newRect.height = Math.max(1, origRect.height + dy);
        } else if (corner === "sw") {
          newRect.width = Math.max(1, origRect.width - dx);
          newRect.height = Math.max(1, origRect.height + dy);
          newRect.left = Math.min(origRect.left + dx, origRect.left + origRect.width - 1);
        } else if (corner === "ne") {
          newRect.width = Math.max(1, origRect.width + dx);
          newRect.height = Math.max(1, origRect.height - dy);
          newRect.top = Math.min(origRect.top + dy, origRect.top + origRect.height - 1);
        } else if (corner === "nw") {
          newRect.width = Math.max(1, origRect.width - dx);
          newRect.height = Math.max(1, origRect.height - dy);
          newRect.left = Math.min(origRect.left + dx, origRect.left + origRect.width - 1);
          newRect.top = Math.min(origRect.top + dy, origRect.top + origRect.height - 1);
        }
        // clamp
        newRect.left = Math.max(0, Math.min(100 - newRect.width, newRect.left));
        newRect.top = Math.max(0, Math.min(100 - newRect.height, newRect.top));
        newRect.width = Math.max(0.5, Math.min(100, newRect.width));
        newRect.height = Math.max(0.5, Math.min(100, newRect.height));
        setRect(newRect);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      // Stop dragging/resizing but do not auto-save — toolbar Save will persist.
      dragState.current = null;
      resizeState.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      // emulate mouse move
      const mm = new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY });
      window.dispatchEvent(mm);
    };

    const onTouchEnd = (e: TouchEvent) => {
      // emulate mouse up
      const mu = new MouseEvent('mouseup');
      window.dispatchEvent(mu);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [rect, selectedSrc, previewRef, content]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    // support touch events by normalizing
    e.stopPropagation();
    let clientX = 0, clientY = 0;
    const anyE = e as any;
    if (anyE.touches && anyE.touches[0]) {
      clientX = anyE.touches[0].clientX;
      clientY = anyE.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    if (!rect) return;
    dragState.current = { dragging: true, startX: clientX, startY: clientY, origLeft: rect.left, origTop: rect.top };
  };

  const startResize = (corner: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    let clientX = 0, clientY = 0;
    const anyE = e as any;
    if (anyE.touches && anyE.touches[0]) {
      clientX = anyE.touches[0].clientX;
      clientY = anyE.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    if (!rect) return;
    resizeState.current = { resizing: true, corner, startX: clientX, startY: clientY, origRect: { ...rect } };
  };

  const saveRectToContent = (src: string, r: { left: number; top: number; width: number; height: number }, origMd?: string | null) => {
    // Replace the first occurrence of an image referencing this src in the markdown content
    // with an HTML <img> tag that includes inline styles for position and size
    try {
      const style = `position:absolute; left:${r.left.toFixed(2)}%; top:${r.top.toFixed(2)}%; width:${r.width.toFixed(2)}%; height:${r.height.toFixed(2)}%;`;
      const imgTag = `<img src="${src}" style="${style}" />`;

      if (origMd) {
        // Replace the exact original markdown snippet
        if (content.includes(origMd)) {
          const newContent = content.replace(origMd, imgTag);
          setContent(newContent);
          return;
        }
      }

      // Attempt to find markdown image syntax referencing this src
      const escaped = escapeRegExp(src);
      const mdRegex = new RegExp(`!\\[[^\\]]*\\]\\((?:[^)]*${escaped}[^)]*)\\)`, 'gm');
      if (mdRegex.test(content)) {
        const newContent = content.replace(mdRegex, imgTag);
        setContent(newContent);
        return;
      }

      // Fallback: find existing HTML <img ... src=\"...\"> and replace
      const htmlRegex = new RegExp(`<img[^>]*src=(\\\"|\\\')${escaped}\\1[^>]*>`, 'gm');
      if (htmlRegex.test(content)) {
        const newContent = content.replace(htmlRegex, imgTag);
        setContent(newContent);
        return;
      }

      // Last resort: replace the raw src occurrence by inserting the tag near it
      const idx = content.indexOf(src);
      if (idx !== -1) {
        // insert imgTag at that position by replacing the next 0 characters
        const newContent = content.slice(0, idx) + imgTag + content.slice(idx + src.length);
        setContent(newContent);
        return;
      }
    } catch (err) {
      // don't crash the editor on save
      console.error("Failed to persist image position", err);
    }
  };

  // Keyboard handlers for nudging / cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!rect) return;
      if (e.key === 'Escape') {
        setSelectedSrc(null);
        setRect(null);
        setOriginalMarkdown(null);
        setShowToolbar(false);
        return;
      }
      let changed = false;
      const step = e.shiftKey ? 1 : 0.25; // percent step
      const newRect = rect ? { ...rect } : null;
      if (!newRect) return;
      if (e.key === 'ArrowLeft') { newRect.left = Math.max(0, newRect.left - step); changed = true; }
      if (e.key === 'ArrowRight') { newRect.left = Math.min(100 - newRect.width, newRect.left + step); changed = true; }
      if (e.key === 'ArrowUp') { newRect.top = Math.max(0, newRect.top - step); changed = true; }
      if (e.key === 'ArrowDown') { newRect.top = Math.min(100 - newRect.height, newRect.top + step); changed = true; }
      if (changed) {
        e.preventDefault();
        setRect(newRect);
        setShowToolbar(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rect]);

  if (!rect || !selectedSrc) return null;

  return (
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 50 }}
    >
      <div
        className="pointer-events-auto border-2 border-dashed border-primary bg-primary/5"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: `${rect.left}%`,
          top: `${rect.top}%`,
          width: `${rect.width}%`,
          height: `${rect.height}%`,
          boxSizing: 'border-box',
        }}
      >
        {/* transparent overlay to capture drag */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{ width: '100%', height: '100%', cursor: 'move' }}
        />

        {/* resize handles */}
        <div onMouseDown={startResize('nw')} style={{ position: 'absolute', left: -6, top: -6, width: 12, height: 12, background: 'white', border: '1px solid #ccc', cursor: 'nwse-resize' }} />
        <div onMouseDown={startResize('ne')} style={{ position: 'absolute', right: -6, top: -6, width: 12, height: 12, background: 'white', border: '1px solid #ccc', cursor: 'nesw-resize' }} />
        <div onMouseDown={startResize('sw')} style={{ position: 'absolute', left: -6, bottom: -6, width: 12, height: 12, background: 'white', border: '1px solid #ccc', cursor: 'nesw-resize' }} />
        <div onMouseDown={startResize('se')} style={{ position: 'absolute', right: -6, bottom: -6, width: 12, height: 12, background: 'white', border: '1px solid #ccc', cursor: 'nwse-resize' }} />
      </div>

      {/* Toolbar with numeric inputs and Save/Cancel */}
      {showToolbar && (
        <div style={{ position: 'absolute', left: `${rect.left + rect.width + 1}%`, top: `${rect.top}%`, zIndex: 60 }} className="pointer-events-auto bg-white p-2 rounded shadow border">
          <div className="flex items-center gap-2">
            <label className="text-xs">W%</label>
            <input className="w-16 border p-1 text-sm" type="number" value={Number(rect.width.toFixed(2))} onChange={(e) => setRect(r => r ? { ...r, width: Math.max(0.5, Math.min(100, Number(e.target.value))) } : r)} />
            <label className="text-xs">H%</label>
            <input className="w-16 border p-1 text-sm" type="number" value={Number(rect.height.toFixed(2))} onChange={(e) => setRect(r => r ? { ...r, height: Math.max(0.5, Math.min(100, Number(e.target.value))) } : r)} />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="px-2 py-1 bg-blue-500 text-white rounded text-sm" onClick={() => { saveRectToContent(selectedSrc, rect, originalMarkdown); setShowToolbar(false); setSelectedSrc(null); setOriginalMarkdown(null); }}>Save</button>
            <button className="px-2 py-1 bg-gray-100 text-sm rounded" onClick={() => { setShowToolbar(false); setSelectedSrc(null); setOriginalMarkdown(null); }} >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditorOverlay;
