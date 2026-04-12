import axiosClient from "@/api/axiosClient";
import type {
  BlogCategoriesResponse,
  BlogCategory,
  BlogCategoryQueryParams,
  CreateBlogCategoryRequest,
  UpdateBlogCategoryRequest,
} from "@/types/blog-category.type";

export const blogCategoryApi = {
  getBlogCategories: async (
    params?: BlogCategoryQueryParams,
    locale?: string,
  ): Promise<BlogCategoriesResponse> => {
    const response = await axiosClient.get<BlogCategoriesResponse>("/blog-categories", {
      params: { ...params, ...(locale ? { locale } : {}) },
    });
    return response.data;
  },

  getBlogCategoryById: async (id: string, locale?: string): Promise<BlogCategory> => {
    const response = await axiosClient.get<BlogCategory>(`/blog-categories/${id}`, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  createBlogCategory: async (
    data: CreateBlogCategoryRequest,
    locale?: string,
  ): Promise<BlogCategory> => {
    const response = await axiosClient.post<BlogCategory>("/blog-categories", data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  updateBlogCategory: async (
    id: string,
    data: UpdateBlogCategoryRequest,
    locale?: string,
  ): Promise<BlogCategory> => {
    const response = await axiosClient.put<BlogCategory>(`/blog-categories/${id}`, data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  deleteBlogCategory: async (id: string): Promise<void> => {
    await axiosClient.delete(`/blog-categories/${id}`);
  },
};
