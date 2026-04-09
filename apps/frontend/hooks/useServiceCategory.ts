import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";
import { serviceCategoryApi } from "@/lib/api/service-category.api";
import type {
  CreateServiceCategoryRequest,
  ServiceCategoryQueryParams,
  UpdateServiceCategoryRequest,
} from "@/types/service-category.type";

export const SERVICE_CATEGORIES_QUERY_KEY = "serviceCategories";

export function useServiceCategories(
  params?: ServiceCategoryQueryParams,
  options?: { enabled?: boolean }
) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useQuery({
    queryKey: [
      SERVICE_CATEGORIES_QUERY_KEY,
      tenantId,
      params?.page,
      params?.limit,
      params?.search,
      params?.status,
    ],
    queryFn: () => serviceCategoryApi.getServiceCategories(params),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (data: CreateServiceCategoryRequest) => serviceCategoryApi.createServiceCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_CATEGORIES_QUERY_KEY, tenantId] });
    },
  });
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceCategoryRequest }) =>
      serviceCategoryApi.updateServiceCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_CATEGORIES_QUERY_KEY, tenantId] });
    },
  });
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => serviceCategoryApi.deleteServiceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_CATEGORIES_QUERY_KEY, tenantId] });
    },
  });
}

