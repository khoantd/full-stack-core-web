import axiosClient from "@/api/axiosClient";
import type {
  MediaFilesParams,
  MediaFilesResponse,
  MediaProvidersResponse,
  MediaProviderId,
} from "@/types/media.type";
import { buildMediaUrl } from "@/lib/media-url";

/** @deprecated Use buildMediaUrl from @/lib/media-url */
export function buildFullUrl(relativePath: string): string {
  return buildMediaUrl(relativePath);
}

export const mediaApi = {
  getProviders: async (): Promise<MediaProvidersResponse> => {
    const response = await axiosClient.get<MediaProvidersResponse>("/media/providers");
    return response.data;
  },

  listFiles: async (params: MediaFilesParams = {}): Promise<MediaFilesResponse> => {
    const { type, limit = 20, continuationToken, provider = "minio" } = params;
    const response = await axiosClient.get<MediaFilesResponse>("/media/files", {
      params: {
        provider,
        ...(type && type !== "all" ? { type } : {}),
        limit,
        ...(continuationToken ? { continuationToken } : {}),
      },
    });
    return response.data;
  },

  deleteFile: async (key: string, provider: MediaProviderId = "minio"): Promise<void> => {
    await axiosClient.delete(`/media/files/${encodeURIComponent(key)}`, {
      params: { provider },
    });
  },
};
