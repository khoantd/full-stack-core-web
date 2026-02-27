"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "@/lib/api/blog.api";
import type { BlogsQueryParams, CreateBlogRequest, UpdateBlogRequest } from "@/types/blog.type";

export const BLOGS_QUERY_KEY = "blogs";

/**
 * Hook to fetch list of blogs with pagination and search
 */
export function useBlogs(params: BlogsQueryParams = {}) {
  const { page = 1, limit = 10, search } = params;

  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, page, limit, search],
    queryFn: () => blogApi.getBlogs({ page, limit, search }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single blog by ID
 */
export function useBlog(id: string | null) {
  return useQuery({
    queryKey: [BLOGS_QUERY_KEY, id],
    queryFn: () => blogApi.getBlogById(id!),
    enabled: !!id, // Only fetch if id is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to create a new blog
 */
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogRequest) => blogApi.createBlog(data),
    onSuccess: () => {
      // Invalidate blogs list to refetch
      queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to update an existing blog
 */
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogRequest }) =>
      blogApi.updateBlog(id, data),
    onSuccess: () => {
      // Invalidate blogs list to refetch
      queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to delete a blog
 */
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlog(id),
    onSuccess: () => {
      // Invalidate blogs list to refetch
      queryClient.invalidateQueries({ queryKey: [BLOGS_QUERY_KEY] });
    },
  });
}
