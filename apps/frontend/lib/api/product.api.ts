import axiosClient from "@/api/axiosClient";
import {
  Product,
  ProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from "@/types/product.type";

export const productApi = {
  getProducts: async (params?: ProductQueryParams): Promise<ProductsResponse> => {
    const response = await axiosClient.get<ProductsResponse>("/products", {
      params,
    });
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await axiosClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await axiosClient.post<Product>("/products", data);
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductRequest
  ): Promise<Product> => {
    const response = await axiosClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`/products/${id}`);
  },
};
