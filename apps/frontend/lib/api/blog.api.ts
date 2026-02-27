import axiosClient from "@/api/axiosClient";
import type {
  Blog,
  BlogsResponse,
  BlogsQueryParams,
  CreateBlogRequest,
  UpdateBlogRequest,
  DeleteBlogResponse,
} from "@/types/blog.type";

export const blogApi = {
  /**
   * Get list of blogs with pagination and search
   */
  getBlogs: async (params: BlogsQueryParams = {}): Promise<BlogsResponse> => {
    const { page = 1, limit = 10, search } = params;
    const response = await axiosClient.get<BlogsResponse>("/blogs", {
      params: { page, limit, search },
    });
    return response.data;
  },

  /**
   * Get a single blog by ID
   */
  getBlogById: async (id: string): Promise<Blog> => {
    const response = await axiosClient.get<Blog>(`/blogs/${id}`);
    return response.data;
  },

  /**
   * Create a new blog
   */
  createBlog: async (data: CreateBlogRequest): Promise<Blog> => {
    const response = await axiosClient.post<Blog>("/blogs", data);
    return response.data;
  },

  /**
   * Update an existing blog
   */
  updateBlog: async (id: string, data: UpdateBlogRequest): Promise<Blog> => {
    const response = await axiosClient.put<Blog>(`/blogs/${id}`, data);
    return response.data;
  },

  /**
   * Delete a blog
   */
  deleteBlog: async (id: string): Promise<DeleteBlogResponse> => {
    const response = await axiosClient.delete<DeleteBlogResponse>(`/blogs/${id}`);
    return response.data;
  },
};
