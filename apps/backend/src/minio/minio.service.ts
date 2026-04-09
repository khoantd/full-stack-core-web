import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as sharp from 'sharp';

const BUCKET = 'imagefolder';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://72.61.125.140:9002';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'admin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'password123';

export interface FileItem {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  contentType: string;
}

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private s3: S3Client;

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

  async uploadFile(bucketName: string, file: Express.Multer.File): Promise<string> {
    const key = `${Date.now()}-${file.originalname}`;

    try {
      await this.s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));
      const relativePath = `/${bucketName}/${key}`;

      if (file.mimetype.startsWith('image/')) {
        await this.generateThumbnails(bucketName, key, file.buffer);
      }

      return relativePath;
    } catch (err) {
      this.logger.error(`Upload failed: ${err.message}`);
      throw new Error(`Upload file failed: ${err.message}`);
    }
  }

  private async generateThumbnails(bucket: string, originalKey: string, buffer: Buffer) {
    const sizes = [200, 800];
    for (const width of sizes) {
      try {
        const thumb = await sharp(buffer).resize(width).jpeg({ quality: 80 }).toBuffer();
        const thumbKey = `thumbnails/${width}/${originalKey}`;
        await this.s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: thumbKey,
          Body: thumb,
          ContentType: 'image/jpeg',
        }));
      } catch (err) {
        this.logger.warn(`Thumbnail ${width}px failed: ${err.message}`);
      }
    }
  }

  async listFiles(
    bucketName: string,
    options: {
      prefix?: string;
      maxKeys?: number;
      continuationToken?: string;
    } = {},
  ): Promise<{ items: FileItem[]; nextContinuationToken?: string; isTruncated: boolean }> {
    try {
      const result = await this.s3.send(new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: options.prefix,
        MaxKeys: options.maxKeys ?? 20,
        ContinuationToken: options.continuationToken,
      }));
      const items = (result.Contents || [])
        .filter(obj => !obj.Key?.startsWith('thumbnails/'))
        .map(obj => ({
          key: obj.Key!,
          url: `/${bucketName}/${obj.Key}`,
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
      this.logger.error(`List files failed: ${err.message}`);
      throw new Error(`List files failed: ${err.message}`);
    }
  }

  async deleteFile(bucketName: string, key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
      const thumbKeys = [`thumbnails/200/${key}`, `thumbnails/800/${key}`];
      await Promise.allSettled(
        thumbKeys.map(k => this.s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: k }))),
      );
    } catch (err) {
      this.logger.error(`Delete failed: ${err.message}`);
      throw new Error(`Delete file failed: ${err.message}`);
    }
  }

  private guessContentType(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
      pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm',
      doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return map[ext ?? ''] ?? 'application/octet-stream';
  }
}
