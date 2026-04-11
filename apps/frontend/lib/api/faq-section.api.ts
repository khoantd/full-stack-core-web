import axiosClient from "@/api/axiosClient";
import type {
  CreateFaqSectionRequest,
  FaqSection,
  FaqSectionsResponse,
  FaqSectionQueryParams,
  UpdateFaqSectionRequest,
} from "@/types/faq-section.type";

export const faqSectionApi = {
  getFaqSections: async (
    params?: FaqSectionQueryParams,
    locale?: string,
  ): Promise<FaqSectionsResponse> => {
    const response = await axiosClient.get<FaqSectionsResponse>("/faq-sections", {
      params: { ...params, ...(locale ? { locale } : {}) },
    });
    return response.data;
  },

  getFaqSectionById: async (id: string, locale?: string): Promise<FaqSection> => {
    const response = await axiosClient.get<FaqSection>(`/faq-sections/${id}`, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  createFaqSection: async (data: CreateFaqSectionRequest, locale?: string): Promise<FaqSection> => {
    const response = await axiosClient.post<FaqSection>("/faq-sections", data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  updateFaqSection: async (
    id: string,
    data: UpdateFaqSectionRequest,
    locale?: string,
  ): Promise<FaqSection> => {
    const response = await axiosClient.put<FaqSection>(`/faq-sections/${id}`, data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  deleteFaqSection: async (id: string): Promise<void> => {
    await axiosClient.delete(`/faq-sections/${id}`);
  },
};
