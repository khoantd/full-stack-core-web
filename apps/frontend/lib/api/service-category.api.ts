import axiosClient from "@/api/axiosClient";
import type {
  CreateServiceCategoryRequest,
  ServiceCategoriesResponse,
  ServiceCategory,
  ServiceCategoryQueryParams,
  UpdateServiceCategoryRequest,
} from "@/types/service-category.type";

export const serviceCategoryApi = {
  getServiceCategories: async (params?: ServiceCategoryQueryParams): Promise<ServiceCategoriesResponse> => {
    const response = await axiosClient.get<ServiceCategoriesResponse>("/service-categories", { params });
    return response.data;
  },

  getServiceCategoryById: async (id: string): Promise<ServiceCategory> => {
    const response = await axiosClient.get<ServiceCategory>(`/service-categories/${id}`);
    return response.data;
  },

  createServiceCategory: async (data: CreateServiceCategoryRequest): Promise<ServiceCategory> => {
    const response = await axiosClient.post<ServiceCategory>("/service-categories", data);
    return response.data;
  },

  updateServiceCategory: async (id: string, data: UpdateServiceCategoryRequest): Promise<ServiceCategory> => {
    const response = await axiosClient.put<ServiceCategory>(`/service-categories/${id}`, data);
    return response.data;
  },

  deleteServiceCategory: async (id: string): Promise<void> => {
    await axiosClient.delete(`/service-categories/${id}`);
  },
};

