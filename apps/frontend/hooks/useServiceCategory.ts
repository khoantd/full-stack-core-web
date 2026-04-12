"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
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
  options?: { enabled?: boolean; locale?: string },
) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [
      SERVICE_CATEGORIES_QUERY_KEY,
      tenantId,
      locale,
      params?.page,
      params?.limit,
      params?.search,
      params?.status,
    ],
    queryFn: () => serviceCategoryApi.getServiceCategories(params, locale),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useServiceCategory(id: string | null, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [SERVICE_CATEGORIES_QUERY_KEY, tenantId, locale, id],
    queryFn: () => serviceCategoryApi.getServiceCategoryById(id!, locale),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateServiceCategory(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: (data: CreateServiceCategoryRequest) =>
      serviceCategoryApi.createServiceCategory(data, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_CATEGORIES_QUERY_KEY, tenantId] });
    },
  });
}

export function useUpdateServiceCategory(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceCategoryRequest }) =>
      serviceCategoryApi.updateServiceCategory(id, data, locale),
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
