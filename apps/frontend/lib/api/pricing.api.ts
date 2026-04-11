import axiosClient from "@/api/axiosClient";
import type {
  Pricing,
  PricingsResponse,
  CreatePricingRequest,
  UpdatePricingRequest,
  PricingQueryParams,
} from "@/types/pricing.type";

export const pricingApi = {
  getPricings: async (params?: PricingQueryParams, locale?: string): Promise<PricingsResponse> => {
    const response = await axiosClient.get<PricingsResponse>("/pricings", {
      params: { ...params, ...(locale ? { locale } : {}) },
    });
    return response.data;
  },

  getPricingById: async (id: string, locale?: string): Promise<Pricing> => {
    const response = await axiosClient.get<Pricing>(`/pricings/${id}`, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  createPricing: async (data: CreatePricingRequest, locale?: string): Promise<Pricing> => {
    const response = await axiosClient.post<Pricing>("/pricings", data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  updatePricing: async (id: string, data: UpdatePricingRequest, locale?: string): Promise<Pricing> => {
    const response = await axiosClient.put<Pricing>(`/pricings/${id}`, data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  deletePricing: async (id: string): Promise<void> => {
    await axiosClient.delete(`/pricings/${id}`);
  },
};

