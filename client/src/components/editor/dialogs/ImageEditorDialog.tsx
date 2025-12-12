import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { fileToDataUrl } from '@/lib/image';

type Props = {
  file: File;
  onClose: (result: string | null) => void;
};

function ImageEditorModal({ file, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [rotate, setRotate] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await fileToDataUrl(file, 2048, 2048);
        if (mounted) setDataUrl(d);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, [file]);

  useEffect(() => {
    if (!dataUrl || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const scaleFactor = Math.max(scale / 100, 0.01);
      // fit within 800x800 preview
      const maxPreview = 800;
      const w = Math.min(img.width * scaleFactor, maxPreview);
      const h = Math.min(img.height * scaleFactor, maxPreview);
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      // rotate around center
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    };
    img.src = dataUrl;
  }, [dataUrl, scale, rotate]);

  const handleInsert = () => {
    if (!canvasRef.current) return onClose(null);
    const out = canvasRef.current.toDataURL('image/jpeg', 0.92);
    onClose(out);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-md shadow-lg p-4 w-[900px] max-w-full">
        <h3 className="text-lg font-semibold mb-2">Edit Image</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <canvas ref={canvasRef} className="w-full border" />
          </div>
          <div style={{ width: 220 }} className="flex flex-col gap-3">
            <div>
              <label className="text-sm">Scale: {scale}%</label>
              <input type="range" min={10} max={200} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-sm">Rotate: {rotate}°</label>
              <input type="range" min={-180} max={180} value={rotate} onChange={(e) => setRotate(Number(e.target.value))} className="w-full" />
            </div>
            <div className="mt-auto flex gap-2">
              <Button onClick={() => onClose(null)} variant="ghost">Cancel</Button>
              <Button onClick={handleInsert}>Insert</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function openImageEditor(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    const cleanup = (result: string | null) => {
      try { root.unmount(); } catch {}
      if (container.parentNode) container.parentNode.removeChild(container);
      resolve(result);
    };
    root.render(<ImageEditorModal file={file} onClose={cleanup} />);
  });
}

export default ImageEditorModal;
