"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "@/lib/api/blog.api";
import type { BlogsQueryParams, CreateBlogRequest, UpdateBlogRequest } from "@/types/blog.type";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";
import { useLocale } from "next-intl";

export const BLOGS_QUERY_KEY = "blogs";

export function useBlogs(params: BlogsQueryParams = {}, options?: { locale?: string }) {
  const { page = 1, limit = 10, search, status } = params;
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;

  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, tenantId, locale, page, limit, search, status],
    queryFn: () => blogApi.getBlogs({ page, limit, search, status }, locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useBlog(id: string | null, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, tenantId, locale, id],
    queryFn: () => blogApi.getBlogById(id!, locale),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBlogVersions(id: string | null) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const locale = useLocale();
  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, tenantId, locale, id, "versions"],
    queryFn: () => blogApi.getVersions(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBlog(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: (data: CreateBlogRequest) => blogApi.createBlog(data, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY, tenantId] }),
  });
}

export function useUpdateBlog(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogRequest }) => blogApi.updateBlog(id, data, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY, tenantId] }),
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY, tenantId] }),
  });
}

export function useRestoreBlogVersion() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: ({ blogId, versionId }: { blogId: string; versionId: string }) =>
      blogApi.restoreVersion(blogId, versionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY, tenantId] }),
  });
}
