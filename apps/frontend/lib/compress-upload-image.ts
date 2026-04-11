import imageCompression from "browser-image-compression";

/** Align with backend IMAGE_MAX_EDGE default; reduces upload size before multipart. */
const MAX_WIDTH_OR_HEIGHT = 2560;
const MAX_SIZE_MB = 2;

/**
 * Client-side downscale/compress for raster images. SVG and GIF are unchanged (GIF keeps animation).
 * Server-side optimization still applies as the source of truth.
 */
export async function compressImageFileIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  try {
    return await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
    });
  } catch {
    return file;
  }
}
