import axiosClient from "@/api/axiosClient";
import type {
  CreateServiceCategoryRequest,
  ServiceCategoriesResponse,
  ServiceCategory,
  ServiceCategoryQueryParams,
  UpdateServiceCategoryRequest,
} from "@/types/service-category.type";

export const serviceCategoryApi = {
  getServiceCategories: async (
    params?: ServiceCategoryQueryParams,
    locale?: string,
  ): Promise<ServiceCategoriesResponse> => {
    const response = await axiosClient.get<ServiceCategoriesResponse>("/service-categories", {
      params: { ...params, ...(locale ? { locale } : {}) },
    });
    return response.data;
  },

  getServiceCategoryById: async (id: string, locale?: string): Promise<ServiceCategory> => {
    const response = await axiosClient.get<ServiceCategory>(`/service-categories/${id}`, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  createServiceCategory: async (
    data: CreateServiceCategoryRequest,
    locale?: string,
  ): Promise<ServiceCategory> => {
    const response = await axiosClient.post<ServiceCategory>("/service-categories", data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  updateServiceCategory: async (
    id: string,
    data: UpdateServiceCategoryRequest,
    locale?: string,
  ): Promise<ServiceCategory> => {
    const response = await axiosClient.put<ServiceCategory>(`/service-categories/${id}`, data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  deleteServiceCategory: async (id: string): Promise<void> => {
    await axiosClient.delete(`/service-categories/${id}`);
  },
};

