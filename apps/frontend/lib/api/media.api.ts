import axiosClient from "@/api/axiosClient";
import { MediaFilesParams, MediaFilesResponse } from "@/types/media.type";

const MINIO_BASE_URL = "https://seyeuthuong.org";

export function buildFullUrl(relativePath: string): string {
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) return relativePath;
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${MINIO_BASE_URL}${path}`;
}

export const mediaApi = {
  listFiles: async (params: MediaFilesParams = {}): Promise<MediaFilesResponse> => {
    const { type, limit = 20, continuationToken } = params;
    const response = await axiosClient.get<MediaFilesResponse>("/minio/files", {
      params: {
        ...(type && type !== "all" ? { type } : {}),
        limit,
        ...(continuationToken ? { continuationToken } : {}),
      },
    });
    return response.data;
  },

  deleteFile: async (key: string): Promise<void> => {
    await axiosClient.delete(`/minio/files/${encodeURIComponent(key)}`);
  },
};
