import axiosClient from "@/api/axiosClient";
import { mapApiBlog } from "@/lib/normalize-blog-status";
import type {
  Blog,
  BlogVersion,
  BlogsResponse,
  BlogsQueryParams,
  CreateBlogRequest,
  UpdateBlogRequest,
  DeleteBlogResponse,
} from "@/types/blog.type";

export const blogApi = {
  getBlogs: async (params: BlogsQueryParams = {}, locale?: string): Promise<BlogsResponse> => {
    const { page = 1, limit = 10, search, status } = params;
    const response = await axiosClient.get<BlogsResponse>("/blogs", {
      params: { page, limit, search, status, ...(locale ? { locale } : {}) },
    });
    const body = response.data;
    return {
      ...body,
      data: (body.data ?? []).map((row) => mapApiBlog(row)),
    };
  },

  getBlogById: async (id: string, locale?: string): Promise<Blog> => {
    const response = await axiosClient.get<Blog>(`/blogs/${id}`, {
      params: locale ? { locale } : undefined,
    });
    return mapApiBlog(response.data);
  },

  createBlog: async (data: CreateBlogRequest, locale?: string): Promise<Blog> => {
    const response = await axiosClient.post<Blog>("/blogs", data, {
      params: locale ? { locale } : undefined,
    });
    return mapApiBlog(response.data);
  },

  updateBlog: async (id: string, data: UpdateBlogRequest, locale?: string): Promise<Blog> => {
    const response = await axiosClient.put<Blog>(`/blogs/${id}`, data, {
      params: locale ? { locale } : undefined,
    });
    return mapApiBlog(response.data);
  },

  deleteBlog: async (id: string): Promise<DeleteBlogResponse> => {
    const response = await axiosClient.delete<DeleteBlogResponse>(`/blogs/${id}`);
    return response.data;
  },

  getVersions: async (id: string): Promise<BlogVersion[]> => {
    const response = await axiosClient.get<BlogVersion[]>(`/blogs/${id}/versions`);
    return response.data;
  },

  restoreVersion: async (blogId: string, versionId: string): Promise<Blog> => {
    const response = await axiosClient.post<Blog>(
      `/blogs/${blogId}/versions/${versionId}/restore`
    );
    return mapApiBlog(response.data);
  },
};
