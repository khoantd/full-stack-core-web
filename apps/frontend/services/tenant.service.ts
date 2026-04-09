import axiosClient from "@/api/axiosClient";
import type { Tenant, CreateTenantRequest, UpdateTenantRequest, FeatureKey, LandingConfig } from "@/types/tenant.type";

type SwitchTenantResponse = {
  user: unknown;
  accessToken: string;
  refreshToken: string;
};

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

  updateFeatures: async (enabledFeatures: FeatureKey[]): Promise<Tenant> => {
    const res = await axiosClient.patch<Tenant>(`/tenants/my/features`, { enabledFeatures });
    return res.data;
  },

  updateLandingConfig: async (config: LandingConfig): Promise<Tenant> => {
    const res = await axiosClient.patch<Tenant>(`/tenants/my/landing`, config);
    return res.data;
  },

  switchMyTenant: async (tenantId: string): Promise<SwitchTenantResponse> => {
    const res = await axiosClient.post<SwitchTenantResponse>(`/tenants/my/switch`, { tenantId });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/tenants/${id}`);
  },
};
