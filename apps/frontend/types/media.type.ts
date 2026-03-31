export interface MediaFile {
  key: string;
  url: string;
  size: number;
  lastModified: string;
  contentType: string;
}

export interface MediaFilesResponse {
  data: MediaFile[];
  nextContinuationToken: string | null;
  isTruncated: boolean;
}

export interface MediaFilesParams {
  type?: string;
  limit?: number;
  continuationToken?: string;
}
