import axiosClient from "@/api/axiosClient";
import {
  Automaker,
  AutomakersResponse,
  AutomakerQueryParams,
  CreateAutomakerRequest,
  UpdateAutomakerRequest,
} from "@/types/automaker.type";

export const automakerApi = {
  getAutomakers: async (params?: AutomakerQueryParams): Promise<AutomakersResponse> => {
    const response = await axiosClient.get<AutomakersResponse>("/automakers", { params });
    return response.data;
  },

  getAutomakerById: async (id: string): Promise<Automaker> => {
    const response = await axiosClient.get<Automaker>(`/automakers/${id}`);
    return response.data;
  },

  createAutomaker: async (data: CreateAutomakerRequest): Promise<Automaker> => {
    const response = await axiosClient.post<Automaker>("/automakers", data);
    return response.data;
  },

  updateAutomaker: async (id: string, data: UpdateAutomakerRequest): Promise<Automaker> => {
    const response = await axiosClient.put<Automaker>(`/automakers/${id}`, data);
    return response.data;
  },

  deleteAutomaker: async (id: string): Promise<void> => {
    await axiosClient.delete(`/automakers/${id}`);
  },
};
