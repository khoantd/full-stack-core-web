import axiosClient from "@/api/axiosClient";
import {
  CategoryProduct,
  CategoryProductsResponse,
  CreateCategoryProductRequest,
  UpdateCategoryProductRequest,
  CategoryProductQueryParams,
} from "@/types/category-product.type";

export const categoryProductApi = {
  getCategoryProducts: async (
    params?: CategoryProductQueryParams
  ): Promise<CategoryProductsResponse> => {
    const response = await axiosClient.get<CategoryProductsResponse>(
      "/category-products",
      { params }
    );
    return response.data;
  },

  getCategoryProductById: async (id: string): Promise<CategoryProduct> => {
    const response = await axiosClient.get<CategoryProduct>(
      `/category-products/${id}`
    );
    return response.data;
  },

  createCategoryProduct: async (
    data: CreateCategoryProductRequest
  ): Promise<CategoryProduct> => {
    const response = await axiosClient.post<CategoryProduct>(
      "/category-products",
      data
    );
    return response.data;
  },

  updateCategoryProduct: async (
    id: string,
    data: UpdateCategoryProductRequest
  ): Promise<CategoryProduct> => {
    const response = await axiosClient.put<CategoryProduct>(
      `/category-products/${id}`,
      data
    );
    return response.data;
  },

  deleteCategoryProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`/category-products/${id}`);
  },
};
