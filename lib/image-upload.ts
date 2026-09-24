export type CompressResult = {
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
};

export async function fileToCompressedDataUrl(
  file: File,
  opts?: { maxDim?: number; quality?: number }
): Promise<CompressResult> {
  const maxDim = opts?.maxDim ?? 1280;
  const quality = opts?.quality ?? 0.8;

  const url = URL.createObjectURL(file);
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");

    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    let dataUrl = canvas.toDataURL("image/webp", quality);
    if (!dataUrl.startsWith("data:image/webp")) {
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    return {
      dataUrl,
      width: w,
      height: h,
      bytes: Math.round(dataUrl.length * 0.75),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}