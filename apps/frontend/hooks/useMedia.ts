"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/media.api";
import { MediaFilesParams } from "@/types/media.type";

export const MEDIA_QUERY_KEY = "media-files";

export function useMediaFiles(params: MediaFilesParams = {}) {
  const { type, limit = 20, continuationToken } = params;
  return useQuery({
    queryKey: [MEDIA_QUERY_KEY, type, limit, continuationToken],
    queryFn: () => mediaApi.listFiles({ type, limit, continuationToken }),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDeleteMediaFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => mediaApi.deleteFile(key),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] }),
  });
}
