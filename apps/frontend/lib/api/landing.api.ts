import axiosClient from '@/api/axiosClient';
import type {
  CreateLandingPageRequest,
  DeleteLandingPageResponse,
  LandingPage,
  LandingPagesQueryParams,
  LandingPagesResponse,
  UpdateLandingPageRequest,
} from '@/types/landing.type';

export const landingApi = {
  getLandingPages: async (
    params: LandingPagesQueryParams = {},
    locale?: string,
  ): Promise<LandingPagesResponse> => {
    const { page = 1, limit = 10, search, status } = params;
    const response = await axiosClient.get<LandingPagesResponse>('/landing-pages', {
      params: {
        page,
        limit,
        search,
        status,
        ...(locale ? { locale } : {}),
      },
    });
    return response.data;
  },

  getLandingPageById: async (id: string, locale?: string): Promise<LandingPage> => {
    const response = await axiosClient.get<LandingPage>(`/landing-pages/${id}`, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  createLandingPage: async (
    data: CreateLandingPageRequest,
    locale?: string,
  ): Promise<LandingPage> => {
    const response = await axiosClient.post<LandingPage>('/landing-pages', data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  updateLandingPage: async (
    id: string,
    data: UpdateLandingPageRequest,
    locale?: string,
  ): Promise<LandingPage> => {
    const response = await axiosClient.put<LandingPage>(`/landing-pages/${id}`, data, {
      params: locale ? { locale } : undefined,
    });
    return response.data;
  },

  deleteLandingPage: async (id: string): Promise<DeleteLandingPageResponse> => {
    const response = await axiosClient.delete<DeleteLandingPageResponse>(`/landing-pages/${id}`);
    return response.data;
  },
};
