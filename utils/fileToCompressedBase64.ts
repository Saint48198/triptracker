// imageCompress.ts
export async function fileToCompressedBase64(
  file: File,
  opts: { maxSide?: number; quality?: number; forceMime?: string } = {}
): Promise<{
  base64: string;
  mimeType: string;
  bytes: number;
  width: number;
  height: number;
}> {
  const { maxSide = 1024, quality = 0.72, forceMime = 'image/jpeg' } = opts;

  const bitmap = await createImageBitmap(file); // fast decode
  const { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), forceMime, quality)
  );

  const base64 = await new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string); // dataURL
    r.readAsDataURL(blob);
  });

  // strip "data:...;base64,"
  const raw = base64.split(',')[1] ?? '';
  return {
    base64: raw,
    mimeType: blob.type || forceMime,
    bytes: blob.size,
    width: w,
    height: h,
  };
}
