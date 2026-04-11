export type MediaProviderId = "minio" | "local";

export interface MediaFile {
  key: string;
  url: string;
  size: number;
  lastModified: string;
  contentType: string;
  provider?: MediaProviderId;
}

export interface MediaFilesResponse {
  data: MediaFile[];
  nextContinuationToken: string | null;
  isTruncated: boolean;
}

export interface MediaFilesParams {
  provider?: MediaProviderId;
  type?: string;
  limit?: number;
  continuationToken?: string;
}

export interface MediaProviderInfo {
  id: MediaProviderId;
  label: string;
  enabled: boolean;
}

export interface MediaProvidersResponse {
  providers: MediaProviderInfo[];
}
