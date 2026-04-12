"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";
import { blogCategoryApi } from "@/lib/api/blog-category.api";
import type {
  BlogCategoryQueryParams,
  CreateBlogCategoryRequest,
  UpdateBlogCategoryRequest,
} from "@/types/blog-category.type";

export const BLOG_CATEGORIES_QUERY_KEY = "blogCategories";

export function useBlogCategories(
  params?: BlogCategoryQueryParams,
  options?: { enabled?: boolean; locale?: string },
) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [
      BLOG_CATEGORIES_QUERY_KEY,
      tenantId,
      locale,
      params?.page,
      params?.limit,
      params?.search,
      params?.status,
    ],
    queryFn: () => blogCategoryApi.getBlogCategories(params, locale),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useBlogCategory(id: string | null, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [BLOG_CATEGORIES_QUERY_KEY, tenantId, locale, id],
    queryFn: () => blogCategoryApi.getBlogCategoryById(id!, locale),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateBlogCategory(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: (data: CreateBlogCategoryRequest) =>
      blogCategoryApi.createBlogCategory(data, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_CATEGORIES_QUERY_KEY, tenantId] });
    },
  });
}

export function useUpdateBlogCategory(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogCategoryRequest }) =>
      blogCategoryApi.updateBlogCategory(id, data, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_CATEGORIES_QUERY_KEY, tenantId] });
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => blogCategoryApi.deleteBlogCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_CATEGORIES_QUERY_KEY, tenantId] });
    },
  });
}
