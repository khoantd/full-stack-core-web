import type { MediaListResult } from '../media.types';

export interface MediaStorageListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface MediaStorage {
  upload(file: Express.Multer.File): Promise<{ key: string }>;
  listFiles(options?: MediaStorageListOptions): Promise<MediaListResult>;
  deleteFile(key: string): Promise<void>;
}
