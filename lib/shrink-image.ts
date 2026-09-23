// Browser-only. Shrinks a photo before it is uploaded.
//
// This is where nearly all of the upload time went: a phone photo is
// 4–12MB at full resolution, and home connections upload at a tenth of
// their download speed. The site never shows anything wider than ~1200px,
// so sending the original was pure waiting. Resizing to a 2000px long edge
// and re-encoding turns a 10MB photo into well under 1MB.

export const MAX_EDGE_PX = 2000;
export const JPEG_QUALITY = 0.85;

// Below this, re-encoding buys nothing worth the CPU time.
const SKIP_UNDER_BYTES = 600 * 1024;

// Left alone: animation and vectors would be destroyed by rasterising.
const UNTOUCHED_TYPES = new Set(["image/gif", "image/svg+xml"]);

export interface ShrinkResult {
  file: File;
  /** true when the returned file is a re-encoded copy, false when it is the original */
  shrunk: boolean;
}

export async function shrinkImage(original: File): Promise<ShrinkResult> {
  if (UNTOUCHED_TYPES.has(original.type)) return { file: original, shrunk: false };

  let bitmap: ImageBitmap;
  try {
    // from-image applies the EXIF rotation so phone photos don't come out
    // sideways once the metadata is stripped by re-encoding.
    bitmap = await createImageBitmap(original, { imageOrientation: "from-image" });
  } catch {
    // The browser can't decode it (HEIC on Chrome, for one). Send as-is and
    // let the size limit have the final say.
    return { file: original, shrunk: false };
  }

  try {
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && original.size < SKIP_UNDER_BYTES) {
      return { file: original, shrunk: false };
    }

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    // Screenshots and logos keep PNG so transparency survives; photos go to
    // JPEG, which is what actually makes them small.
    const keepPng = original.type === "image/png";
    const outType = keepPng ? "image/png" : "image/jpeg";

    const blob = await encode(bitmap, width, height, outType);
    if (!blob || blob.size >= original.size) {
      return { file: original, shrunk: false };
    }

    const name = original.name.replace(/\.[^.]+$/, "") + (keepPng ? ".png" : ".jpg");
    return { file: new File([blob], name, { type: outType }), shrunk: true };
  } finally {
    bitmap.close();
  }
}

async function encode(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  type: string
): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.convertToBlob({ type, quality: JPEG_QUALITY });
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, type, JPEG_QUALITY));
}
