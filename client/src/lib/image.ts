export async function fileToDataUrl(file: File, maxWidth = 2048, maxHeight = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // compute target size preserving aspect ratio
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        const targetW = Math.round(width * ratio);
        const targetH = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Cannot get canvas context'));
        // Fill white background to avoid transparent PNGs looking odd when used as background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
      img.src = String(reader.result);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
