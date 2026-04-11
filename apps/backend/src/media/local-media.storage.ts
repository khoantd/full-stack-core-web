import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { jpegThumbnailBuffer, prepareStorageFile } from './image-processing';
import type { MediaStorage } from './interfaces/media-storage.interface';
import type { MediaListResult, MediaStorageListItem } from './media.types';

const THUMB_PREFIX = 'thumbnails';

function encodeOffset(n: number): string {
  return Buffer.from(String(n), 'utf8').toString('base64url');
}

function decodeOffset(token: string): number {
  const n = parseInt(Buffer.from(token, 'base64url').toString('utf8'), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

@Injectable()
export class LocalMediaStorage implements MediaStorage {
  private readonly logger = new Logger(LocalMediaStorage.name);
  private readonly root: string;

  constructor() {
    this.root = path.resolve(process.env.LOCAL_MEDIA_ROOT || './uploads/media');
  }

  getRoot(): string {
    return this.root;
  }

  resolveSafeFile(key: string): string | null {
    const decoded = decodeURIComponent(key);
    if (decoded.includes('..') || path.isAbsolute(decoded)) {
      return null;
    }
    const candidate = path.resolve(this.root, decoded);
    const rel = path.relative(this.root, candidate);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      return null;
    }
    return candidate;
  }

  async upload(file: Express.Multer.File): Promise<{ key: string }> {
    const prepared = await prepareStorageFile(file);
    const key = `${Date.now()}-${prepared.sanitizedFileName}`;
    const fullPath = path.join(this.root, key);

    await fs.mkdir(this.root, { recursive: true });
    await fs.writeFile(fullPath, prepared.buffer);

    if (prepared.contentType.startsWith('image/')) {
      await this.generateThumbnails(key, prepared.buffer);
    }

    return { key };
  }

  private async generateThumbnails(originalKey: string, buffer: Buffer) {
    const sizes = [200, 800];
    for (const width of sizes) {
      try {
        const thumb = await jpegThumbnailBuffer(buffer, width);
        const thumbDir = path.join(this.root, THUMB_PREFIX, String(width));
        await fs.mkdir(thumbDir, { recursive: true });
        const thumbPath = path.join(thumbDir, originalKey);
        await fs.writeFile(thumbPath, thumb);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Thumbnail ${width}px failed: ${message}`);
      }
    }
  }

  async listFiles(
    options: {
      prefix?: string;
      maxKeys?: number;
      continuationToken?: string;
    } = {},
  ): Promise<MediaListResult> {
    const maxKeys = Math.min(options.maxKeys ?? 20, 100);
    const offset = options.continuationToken ? decodeOffset(options.continuationToken) : 0;

    let names: string[];
    try {
      names = await fs.readdir(this.root);
    } catch {
      await fs.mkdir(this.root, { recursive: true });
      names = [];
    }

    const files: string[] = [];
    for (const name of names) {
      if (name === THUMB_PREFIX || name.startsWith('.')) continue;
      const statPath = path.join(this.root, name);
      const st = await fs.stat(statPath).catch(() => null);
      if (st?.isFile()) {
        files.push(name);
      }
    }

    const prefix = options.prefix;
    let filtered = files;
    if (prefix) {
      filtered = files.filter(f => f.startsWith(prefix));
    }

    const withMeta: Array<{ key: string; mtime: number; size: number }> = [];
    for (const key of filtered) {
      const statPath = path.join(this.root, key);
      const st = await fs.stat(statPath).catch(() => null);
      if (!st?.isFile()) continue;
      withMeta.push({ key, mtime: st.mtimeMs, size: st.size });
    }

    withMeta.sort((a, b) => b.mtime - a.mtime);

    const slice = withMeta.slice(offset, offset + maxKeys);
    const items: MediaStorageListItem[] = slice.map(row => ({
      key: row.key,
      size: row.size,
      lastModified: new Date(row.mtime),
      contentType: this.guessContentType(row.key),
    }));

    const nextOffset = offset + maxKeys;
    const isTruncated = nextOffset < withMeta.length;
    const nextContinuationToken = isTruncated ? encodeOffset(nextOffset) : undefined;

    return {
      items,
      nextContinuationToken,
      isTruncated,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const fullPath = this.resolveSafeFile(key);
    if (!fullPath) {
      throw new Error('Invalid key');
    }
    await fs.unlink(fullPath).catch(() => {
      throw new Error('Delete file failed');
    });
    const thumb200 = path.join(this.root, THUMB_PREFIX, '200', key);
    const thumb800 = path.join(this.root, THUMB_PREFIX, '800', key);
    await Promise.allSettled([fs.unlink(thumb200), fs.unlink(thumb800)]);
  }

  private guessContentType(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      mp4: 'video/mp4',
      webm: 'video/webm',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return map[ext ?? ''] ?? 'application/octet-stream';
  }
}
