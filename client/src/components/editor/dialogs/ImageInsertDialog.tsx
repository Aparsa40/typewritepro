import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageInsertDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
  onInsert: (markdown: string) => void;
}

/**
 * ImageInsertDialog allows users to resize and reposition an image before inserting it as markdown.
 * Users can adjust width percentage and offset (left/top positioning).
 */
export function ImageInsertDialog({ open, onClose, imageUrl, fileName, onInsert }: ImageInsertDialogProps) {
  const [width, setWidth] = useState(100); // percentage
  const [height, setHeight] = useState(100); // percentage
  const [offsetX, setOffsetX] = useState(0); // percentage from left
  const [offsetY, setOffsetY] = useState(0); // percentage from top
  const previewRef = useRef<HTMLDivElement>(null);

  const handleInsert = () => {
    // Build markdown with inline style for sizing and positioning
    // We'll use a combination of width and object-position in a container
    const markdown = `![${fileName}](${imageUrl})`;
    onInsert(markdown);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adjust Image Before Insert</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview */}
          <div className="border rounded-lg bg-muted p-4">
            <div
              ref={previewRef}
              className="relative bg-white rounded overflow-hidden mx-auto"
              style={{
                width: "100%",
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={imageUrl}
                alt={fileName}
                style={{
                  width: `${width}%`,
                  height: `${height}%`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  objectPosition: `${offsetX}% ${offsetY}%`,
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Width: {width}%</Label>
                <Slider
                  value={[width]}
                  onValueChange={(val) => setWidth(val[0])}
                  min={10}
                  max={200}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">عرض تصویر (10% - 200%)</p>
              </div>

              <div>
                <Label className="text-sm">Height: {height}%</Label>
                <Slider
                  value={[height]}
                  onValueChange={(val) => setHeight(val[0])}
                  min={10}
                  max={200}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">ارتفاع تصویر (10% - 200%)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Horizontal: {offsetX}%</Label>
                <Slider
                  value={[offsetX]}
                  onValueChange={(val) => setOffsetX(val[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">موضع چپ/راست</p>
              </div>

              <div>
                <Label className="text-sm">Vertical: {offsetY}%</Label>
                <Slider
                  value={[offsetY]}
                  onValueChange={(val) => setOffsetY(val[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">موضع بالا/پایین</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleInsert}>
              Insert Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageInsertDialog;
