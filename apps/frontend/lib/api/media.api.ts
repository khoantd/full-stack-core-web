import axiosClient from "@/api/axiosClient";
import { MediaFilesResponse } from "@/types/media.type";

const MINIO_BASE_URL = "https://seyeuthuong.org";

export function buildFullUrl(relativePath: string): string {
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) return relativePath;
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${MINIO_BASE_URL}${path}`;
}

export const mediaApi = {
  listFiles: async (type?: string): Promise<MediaFilesResponse> => {
    const response = await axiosClient.get<MediaFilesResponse>("/minio/files", {
      params: type && type !== "all" ? { type } : undefined,
    });
    return response.data;
  },

  deleteFile: async (key: string): Promise<void> => {
    await axiosClient.delete(`/minio/files/${encodeURIComponent(key)}`);
  },
};
