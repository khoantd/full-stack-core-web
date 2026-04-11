import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { jpegThumbnailBuffer, prepareStorageFile } from './image-processing';
import type { MediaStorage } from './interfaces/media-storage.interface';
import type { MediaListResult, MediaStorageListItem } from './media.types';

export const MINIO_BUCKET = 'imagefolder';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://72.61.125.140:9002';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'admin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'password123';

@Injectable()
export class MinioMediaStorage implements MediaStorage {
  private readonly logger = new Logger(MinioMediaStorage.name);
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: MINIO_ENDPOINT,
      credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
      region: 'us-east-1',
    });
  }

  async upload(file: Express.Multer.File): Promise<{ key: string }> {
    const prepared = await prepareStorageFile(file);
    const key = `${Date.now()}-${prepared.sanitizedFileName}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: MINIO_BUCKET,
          Key: key,
          Body: prepared.buffer,
          ContentType: prepared.contentType,
        }),
      );

      if (prepared.contentType.startsWith('image/')) {
        await this.generateThumbnails(key, prepared.buffer);
      }

      return { key };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Upload failed: ${message}`);
      throw new Error(`Upload file failed: ${message}`);
    }
  }

  private async generateThumbnails(originalKey: string, buffer: Buffer) {
    const sizes = [200, 800];
    for (const width of sizes) {
      try {
        const thumb = await jpegThumbnailBuffer(buffer, width);
        const thumbKey = `thumbnails/${width}/${originalKey}`;
        await this.s3.send(
          new PutObjectCommand({
            Bucket: MINIO_BUCKET,
            Key: thumbKey,
            Body: thumb,
            ContentType: 'image/jpeg',
          }),
        );
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
    try {
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: MINIO_BUCKET,
          Prefix: options.prefix,
          MaxKeys: options.maxKeys ?? 20,
          ContinuationToken: options.continuationToken,
        }),
      );
      const items: MediaStorageListItem[] = (result.Contents || [])
        .filter(obj => obj.Key && !obj.Key.startsWith('thumbnails/'))
        .map(obj => ({
          key: obj.Key!,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified ?? new Date(),
          contentType: this.guessContentType(obj.Key!),
        }));
      return {
        items,
        nextContinuationToken: result.NextContinuationToken,
        isTruncated: result.IsTruncated ?? false,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`List files failed: ${message}`);
      throw new Error(`List files failed: ${message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: key }));
      const thumbKeys = [`thumbnails/200/${key}`, `thumbnails/800/${key}`];
      await Promise.allSettled(
        thumbKeys.map(k => this.s3.send(new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: k }))),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Delete failed: ${message}`);
      throw new Error(`Delete file failed: ${message}`);
    }
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
