import { Logger } from '@nestjs/common';
import * as path from 'path';
/** CommonJS default export; `import * as sharp` breaks at runtime with Nest/SWC (sharp is not callable). */
import sharp = require('sharp');

const logger = new Logger('ImageProcessing');

function parseBool(v: string | undefined, defaultVal: boolean): boolean {
  if (v === undefined || v === '') return defaultVal;
  return v === 'true' || v === '1' || v === 'yes';
}

function sanitizeFileName(name: string): string {
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function readMaxEdge(): number {
  const raw = parseInt(process.env.IMAGE_MAX_EDGE || '2560', 10);
  const n = Number.isFinite(raw) && raw > 0 ? raw : 2560;
  return Math.min(n, 8192);
}

function readWebpQuality(): number {
  const q = parseInt(process.env.IMAGE_WEBP_QUALITY || '82', 10);
  return Math.min(100, Math.max(1, Number.isFinite(q) ? q : 82));
}

function readJpegQuality(): number {
  const q = parseInt(process.env.IMAGE_JPEG_QUALITY || '85', 10);
  return Math.min(100, Math.max(1, Number.isFinite(q) ? q : 85));
}

function readOutputFormat(): 'webp' | 'jpeg' {
  return process.env.IMAGE_OUTPUT_FORMAT === 'jpeg' ? 'jpeg' : 'webp';
}

async function optimizeRasterImage(buffer: Buffer): Promise<{
  buffer: Buffer;
  contentType: string;
  extension: string;
}> {
  const maxEdge = readMaxEdge();
  const format = readOutputFormat();
  const pipeline = sharp(buffer)
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    });

  if (format === 'webp') {
    const out = await pipeline.webp({ quality: readWebpQuality(), effort: 4 }).toBuffer();
    return { buffer: out, contentType: 'image/webp', extension: '.webp' };
  }
  const out = await pipeline.jpeg({ quality: readJpegQuality(), mozjpeg: true }).toBuffer();
  return { buffer: out, contentType: 'image/jpeg', extension: '.jpg' };
}

export interface PreparedStorageFile {
  buffer: Buffer;
  contentType: string;
  sanitizedFileName: string;
}

/**
 * Optionally resizes and re-encodes raster images; passes through SVG, GIF, non-images, and on failure.
 */
export async function prepareStorageFile(file: Express.Multer.File): Promise<PreparedStorageFile> {
  const safe = sanitizeFileName(file.originalname);

  if (!file.mimetype.startsWith('image/')) {
    return { buffer: file.buffer, contentType: file.mimetype, sanitizedFileName: safe };
  }

  if (file.mimetype === 'image/svg+xml' || file.mimetype === 'image/gif') {
    return { buffer: file.buffer, contentType: file.mimetype, sanitizedFileName: safe };
  }

  if (!parseBool(process.env.IMAGE_OPTIMIZATION_ENABLED, true)) {
    return { buffer: file.buffer, contentType: file.mimetype, sanitizedFileName: safe };
  }

  try {
    const optimized = await optimizeRasterImage(file.buffer);
    const stem = path.parse(safe).name || 'image';
    return {
      buffer: optimized.buffer,
      contentType: optimized.contentType,
      sanitizedFileName: `${stem}${optimized.extension}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Image optimization failed, storing original: ${msg}`);
    return { buffer: file.buffer, contentType: file.mimetype, sanitizedFileName: safe };
  }
}

/** JPEG thumbnails for listing / previews (fixed widths). */
export async function jpegThumbnailBuffer(source: Buffer, width: number): Promise<Buffer> {
  return sharp(source)
    .resize({ width, fit: 'inside', withoutEnlargement: false })
    .jpeg({ quality: 80 })
    .toBuffer();
}
