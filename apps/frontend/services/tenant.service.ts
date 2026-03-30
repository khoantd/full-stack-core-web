import axiosClient from "@/api/axiosClient";
import type { Tenant, CreateTenantRequest, UpdateTenantRequest } from "@/types/tenant.type";

export const tenantService = {
  getAll: async (): Promise<Tenant[]> => {
    const res = await axiosClient.get<Tenant[]>("/tenants");
    return res.data;
  },

  getById: async (id: string): Promise<Tenant> => {
    const res = await axiosClient.get<Tenant>(`/tenants/${id}`);
    return res.data;
  },

  create: async (data: CreateTenantRequest): Promise<Tenant> => {
    const res = await axiosClient.post<Tenant>("/tenants", data);
    return res.data;
  },

  update: async (id: string, data: UpdateTenantRequest): Promise<Tenant> => {
    const res = await axiosClient.put<Tenant>(`/tenants/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/tenants/${id}`);
  },
};
