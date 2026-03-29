import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/media.api";

export const MEDIA_QUERY_KEY = "media-files";

export function useMediaFiles(type?: string) {
  return useQuery({
    queryKey: [MEDIA_QUERY_KEY, type],
    queryFn: () => mediaApi.listFiles(type),
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
