export type MediaProviderId = 'minio' | 'local';

/** API / client list row */
export interface MediaFileItem {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  contentType: string;
  provider: MediaProviderId;
}

/** Raw row from a storage adapter (URL added by MediaService) */
export interface MediaStorageListItem {
  key: string;
  size: number;
  lastModified: Date;
  contentType: string;
}

export interface MediaListResult {
  items: MediaStorageListItem[];
  nextContinuationToken?: string;
  isTruncated: boolean;
}
