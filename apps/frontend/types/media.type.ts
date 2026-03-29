export interface MediaFile {
  key: string;
  url: string;
  size: number;
  lastModified: string;
  contentType: string;
}

export interface MediaFilesResponse {
  data: MediaFile[];
}
