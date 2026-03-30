import axiosClient from "@/api/axiosClient";
import type {
  Service,
  ServicesResponse,
  ServicesQueryParams,
  CreateServiceRequest,
  UpdateServiceRequest,
  DeleteServiceResponse,
} from "@/types/service.type";

export const serviceApi = {
  getServices: async (params: ServicesQueryParams = {}): Promise<ServicesResponse> => {
    const { page = 1, limit = 10, search, status, category } = params;
    const response = await axiosClient.get<ServicesResponse>("/services", {
      params: { page, limit, search, status, category },
    });
    return response.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await axiosClient.get<Service>(`/services/${id}`);
    return response.data;
  },

  createService: async (data: CreateServiceRequest): Promise<Service> => {
    const response = await axiosClient.post<Service>("/services", data);
    return response.data;
  },

  updateService: async (id: string, data: UpdateServiceRequest): Promise<Service> => {
    const response = await axiosClient.put<Service>(`/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string): Promise<DeleteServiceResponse> => {
    const response = await axiosClient.delete<DeleteServiceResponse>(`/services/${id}`);
    return response.data;
  },
};
