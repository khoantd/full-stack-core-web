import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { MinioMediaStorage, MINIO_BUCKET } from './minio-media.storage';
import { LocalMediaStorage } from './local-media.storage';
import type { MediaProviderId, MediaFileItem } from './media.types';

function trimSlash(s: string): string {
  return s.replace(/\/+$/, '');
}

function parseBool(v: string | undefined, defaultTrue: boolean): boolean {
  if (v === undefined || v === '') return defaultTrue;
  return v === 'true' || v === '1' || v === 'yes';
}

@Injectable()
export class MediaService {
  readonly minioEnabled: boolean;
  readonly localEnabled: boolean;
  private readonly minioBase: string;
  private readonly localBase: string;

  constructor(
    private readonly minioStorage: MinioMediaStorage,
    private readonly localStorage: LocalMediaStorage,
  ) {
    this.minioEnabled = parseBool(process.env.MEDIA_PROVIDER_MINIO_ENABLED, true);
    this.localEnabled = parseBool(process.env.MEDIA_PROVIDER_LOCAL_ENABLED, false);
    this.minioBase = trimSlash(
      process.env.PUBLIC_MEDIA_BASE_URL_MINIO ||
        process.env.PUBLIC_MEDIA_BASE_URL ||
        '',
    );
    this.localBase = trimSlash(
      process.env.PUBLIC_MEDIA_BASE_URL_LOCAL ||
        process.env.PUBLIC_MEDIA_BASE_URL ||
        '',
    );
  }

  getProviders(): { id: MediaProviderId; label: string; enabled: boolean }[] {
    return [
      { id: 'minio', label: 'Object storage (MinIO)', enabled: this.minioEnabled },
      { id: 'local', label: 'Direct upload (local disk)', enabled: this.localEnabled },
    ];
  }

  assertProvider(provider: MediaProviderId): void {
    if (provider === 'minio' && !this.minioEnabled) {
      throw new ServiceUnavailableException('MinIO media provider is disabled');
    }
    if (provider === 'local' && !this.localEnabled) {
      throw new ServiceUnavailableException('Local media provider is disabled');
    }
  }

  parseProvider(raw: string | undefined, fallback: MediaProviderId = 'minio'): MediaProviderId {
    if (!raw || raw === '') return fallback;
    if (raw === 'minio' || raw === 'local') return raw;
    throw new BadRequestException('Invalid provider (use minio or local)');
  }

  buildAbsoluteUrl(provider: MediaProviderId, key: string): string {
    if (provider === 'minio') {
      if (!this.minioBase) {
        throw new ServiceUnavailableException('PUBLIC_MEDIA_BASE_URL_MINIO or PUBLIC_MEDIA_BASE_URL is not configured');
      }
      const path = `/${MINIO_BUCKET}/${key}`.replace(/\/+/g, '/');
      return `${this.minioBase}${path}`;
    }
    if (!this.localBase) {
      throw new ServiceUnavailableException('PUBLIC_MEDIA_BASE_URL_LOCAL or PUBLIC_MEDIA_BASE_URL is not configured');
    }
    return `${this.localBase}/media/public/${encodeURIComponent(key)}`;
  }

  async upload(provider: MediaProviderId, file: Express.Multer.File): Promise<{ url: string }> {
    this.assertProvider(provider);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const storage = provider === 'minio' ? this.minioStorage : this.localStorage;
    const { key } = await storage.upload(file);
    return { url: this.buildAbsoluteUrl(provider, key) };
  }

  async listFiles(
    provider: MediaProviderId,
    options: {
      type?: string;
      maxKeys?: number;
      continuationToken?: string;
    },
  ): Promise<{ data: MediaFileItem[]; nextContinuationToken: string | null; isTruncated: boolean }> {
    this.assertProvider(provider);
    const storage = provider === 'minio' ? this.minioStorage : this.localStorage;
    const result = await storage.listFiles({
      maxKeys: options.maxKeys,
      continuationToken: options.continuationToken,
    });

    let items = result.items.map(row => ({
      key: row.key,
      url: this.buildAbsoluteUrl(provider, row.key),
      size: row.size,
      lastModified: row.lastModified,
      contentType: row.contentType,
      provider,
    }));

    const type = options.type;
    if (type && type !== 'all') {
      items = items.filter(f => {
        if (type === 'image') return f.contentType.startsWith('image/');
        if (type === 'video') return f.contentType.startsWith('video/');
        if (type === 'document') {
          return f.contentType.startsWith('application/') || f.contentType === 'text/plain';
        }
        return true;
      });
    }

    return {
      data: items,
      nextContinuationToken: result.nextContinuationToken ?? null,
      isTruncated: result.isTruncated,
    };
  }

  async deleteFile(provider: MediaProviderId, key: string): Promise<void> {
    this.assertProvider(provider);
    const storage = provider === 'minio' ? this.minioStorage : this.localStorage;
    await storage.deleteFile(key);
  }

  resolveLocalFilePath(key: string): string | null {
    return this.localStorage.resolveSafeFile(key);
  }

  guessContentType(key: string): string {
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
    };
    return map[ext ?? ''] ?? 'application/octet-stream';
  }
}
