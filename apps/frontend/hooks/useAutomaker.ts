import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { automakerApi } from "@/lib/api/automaker.api";
import { AutomakerQueryParams, CreateAutomakerRequest, UpdateAutomakerRequest } from "@/types/automaker.type";

export const AUTOMAKERS_QUERY_KEY = "automakers";

export function useAutomakers(params?: AutomakerQueryParams) {
  return useQuery({
    queryKey: [AUTOMAKERS_QUERY_KEY, params?.page, params?.limit, params?.search],
    queryFn: () => automakerApi.getAutomakers(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateAutomaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAutomakerRequest) => automakerApi.createAutomaker(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [AUTOMAKERS_QUERY_KEY] }),
  });
}

export function useUpdateAutomaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomakerRequest }) =>
      automakerApi.updateAutomaker(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [AUTOMAKERS_QUERY_KEY] }),
  });
}

export function useDeleteAutomaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automakerApi.deleteAutomaker(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [AUTOMAKERS_QUERY_KEY] }),
  });
}
