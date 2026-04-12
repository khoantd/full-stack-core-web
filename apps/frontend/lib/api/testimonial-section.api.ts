import axiosClient from "@/api/axiosClient";
import type {
  CreateTestimonialSectionRequest,
  TestimonialSection,
  TestimonialSectionsResponse,
  TestimonialSectionQueryParams,
  UpdateTestimonialSectionRequest,
} from "@/types/testimonial-section.type";

export const testimonialSectionApi = {
  getTestimonialSections: async (
    params?: TestimonialSectionQueryParams,
    locale?: string,
  ): Promise<TestimonialSectionsResponse> => {
    const response = await axiosClient.get<TestimonialSectionsResponse>("/testimonial-sections", {
      params: { ...params, ...(locale ? { locale } : {}) },
    });
    return response.data;
  },

  getTestimonialSectionById: async (id: string, locale?: string): Promise<TestimonialSection> => {
    const response = await axiosClient.get<TestimonialSection>(`/testimonial-sections/${id}`, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  createTestimonialSection: async (
    data: CreateTestimonialSectionRequest,
    locale?: string,
  ): Promise<TestimonialSection> => {
    const response = await axiosClient.post<TestimonialSection>("/testimonial-sections", data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  updateTestimonialSection: async (
    id: string,
    data: UpdateTestimonialSectionRequest,
    locale?: string,
  ): Promise<TestimonialSection> => {
    const response = await axiosClient.put<TestimonialSection>(`/testimonial-sections/${id}`, data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  deleteTestimonialSection: async (id: string): Promise<void> => {
    await axiosClient.delete(`/testimonial-sections/${id}`);
  },
};
