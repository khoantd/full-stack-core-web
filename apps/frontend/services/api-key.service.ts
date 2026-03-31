import axiosClient from "@/api/axiosClient";
import type { ApiKey, CreatedApiKey, CreateApiKeyRequest } from "@/types/api-key.type";

export const apiKeyService = {
  getAll: async (): Promise<ApiKey[]> => {
    const res = await axiosClient.get<ApiKey[]>("/api-keys");
    return res.data;
  },

  create: async (data: CreateApiKeyRequest): Promise<CreatedApiKey> => {
    const res = await axiosClient.post<CreatedApiKey>("/api-keys", data);
    return res.data;
  },

  revoke: async (id: string): Promise<ApiKey> => {
    const res = await axiosClient.patch<ApiKey>(`/api-keys/${id}/revoke`);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api-keys/${id}`);
  },
};
