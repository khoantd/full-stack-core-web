"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceApi } from "@/lib/api/service.api";
import type { ServicesQueryParams, CreateServiceRequest, UpdateServiceRequest } from "@/types/service.type";

export const SERVICES_QUERY_KEY = "services";

export function useServices(params: ServicesQueryParams = {}) {
  const { page = 1, limit = 10, search, status, category, categoryIds } = params;
  return useQuery({
    queryKey: [SERVICES_QUERY_KEY, page, limit, search, status, category, categoryIds?.join(",")],
    queryFn: () => serviceApi.getServices({ page, limit, search, status, category, categoryIds }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useService(id: string | null) {
  return useQuery({
    queryKey: [SERVICES_QUERY_KEY, id],
    queryFn: () => serviceApi.getServiceById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceApi.createService(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) =>
      serviceApi.updateService(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceApi.deleteService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] }),
  });
}
