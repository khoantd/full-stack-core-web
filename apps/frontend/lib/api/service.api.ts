import axiosClient from "@/api/axiosClient";
import { mapApiService } from "@/lib/normalize-service-status";
import type {
  Service,
  ServicesResponse,
  ServicesQueryParams,
  CreateServiceRequest,
  UpdateServiceRequest,
  DeleteServiceResponse,
} from "@/types/service.type";

export type ServiceLocale = "en" | "vi";

export const serviceApi = {
  getServices: async (params: ServicesQueryParams = {}): Promise<ServicesResponse> => {
    const { page = 1, limit = 10, search, status, category, categoryIds } = params;
    const response = await axiosClient.get<ServicesResponse>("/services", {
      params: { page, limit, search, status, category, ...(categoryIds?.length ? { categoryIds: categoryIds.join(",") } : {}) },
    });
    const body = response.data;
    return {
      ...body,
      data: (body.data ?? []).map((row) => mapApiService(row)),
    };
  },

  getServiceById: async (id: string, opts?: { locale?: ServiceLocale }): Promise<Service> => {
    const response = await axiosClient.get<Service>(`/services/${id}`, {
      params: { ...(opts?.locale ? { locale: opts.locale } : {}) },
    });
    return mapApiService(response.data);
  },

  createService: async (data: CreateServiceRequest, opts?: { locale?: ServiceLocale }): Promise<Service> => {
    const response = await axiosClient.post<Service>("/services", data, {
      params: { ...(opts?.locale ? { locale: opts.locale } : {}) },
    });
    return mapApiService(response.data);
  },

  updateService: async (id: string, data: UpdateServiceRequest, opts?: { locale?: ServiceLocale }): Promise<Service> => {
    const response = await axiosClient.put<Service>(`/services/${id}`, data, {
      params: { ...(opts?.locale ? { locale: opts.locale } : {}) },
    });
    return mapApiService(response.data);
  },

  deleteService: async (id: string): Promise<DeleteServiceResponse> => {
    const response = await axiosClient.delete<DeleteServiceResponse>(`/services/${id}`);
    return response.data;
  },
};
