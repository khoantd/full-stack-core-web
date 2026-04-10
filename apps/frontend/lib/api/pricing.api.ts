import axiosClient from "@/api/axiosClient";
import type {
  Pricing,
  PricingsResponse,
  CreatePricingRequest,
  UpdatePricingRequest,
  PricingQueryParams,
} from "@/types/pricing.type";

export const pricingApi = {
  getPricings: async (params?: PricingQueryParams): Promise<PricingsResponse> => {
    const response = await axiosClient.get<PricingsResponse>("/pricings", { params });
    return response.data;
  },

  getPricingById: async (id: string): Promise<Pricing> => {
    const response = await axiosClient.get<Pricing>(`/pricings/${id}`);
    return response.data;
  },

  createPricing: async (data: CreatePricingRequest): Promise<Pricing> => {
    const response = await axiosClient.post<Pricing>("/pricings", data);
    return response.data;
  },

  updatePricing: async (id: string, data: UpdatePricingRequest): Promise<Pricing> => {
    const response = await axiosClient.put<Pricing>(`/pricings/${id}`, data);
    return response.data;
  },

  deletePricing: async (id: string): Promise<void> => {
    await axiosClient.delete(`/pricings/${id}`);
  },
};

