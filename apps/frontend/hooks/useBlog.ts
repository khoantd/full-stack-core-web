"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "@/lib/api/blog.api";
import type { BlogsQueryParams, CreateBlogRequest, UpdateBlogRequest } from "@/types/blog.type";

export const BLOGS_QUERY_KEY = "blogs";

export function useBlogs(params: BlogsQueryParams = {}) {
  const { page = 1, limit = 10, search, status } = params;

  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, page, limit, search, status],
    queryFn: () => blogApi.getBlogs({ page, limit, search, status }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useBlog(id: string | null) {
  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, id],
    queryFn: () => blogApi.getBlogById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBlogVersions(id: string | null) {
  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, id, "versions"],
    queryFn: () => blogApi.getVersions(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogRequest) => blogApi.createBlog(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY] }),
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogRequest }) => blogApi.updateBlog(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY] }),
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY] }),
  });
}

export function useRestoreBlogVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blogId, versionId }: { blogId: string; versionId: string }) =>
      blogApi.restoreVersion(blogId, versionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY] }),
  });
}
