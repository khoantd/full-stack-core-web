"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/media.api";
import type { MediaFilesParams, MediaProviderId } from "@/types/media.type";

export const MEDIA_QUERY_KEY = "media-files";

export function useMediaProviders() {
  return useQuery({
    queryKey: ["media-providers"],
    queryFn: () => mediaApi.getProviders(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useMediaFiles(params: MediaFilesParams = {}) {
  const { type, limit = 20, continuationToken, provider = "minio" } = params;
  return useQuery({
    queryKey: [MEDIA_QUERY_KEY, provider, type, limit, continuationToken],
    queryFn: () => mediaApi.listFiles({ type, limit, continuationToken, provider }),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDeleteMediaFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, provider }: { key: string; provider: MediaProviderId }) =>
      mediaApi.deleteFile(key, provider),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] }),
  });
}
