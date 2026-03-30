import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "@/services/tenant.service";
import type { CreateTenantRequest, UpdateTenantRequest } from "@/types/tenant.type";

export const TENANT_QUERY_KEY = ["tenants"];

export function useTenants() {
  return useQuery({
    queryKey: TENANT_QUERY_KEY,
    queryFn: tenantService.getAll,
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: [...TENANT_QUERY_KEY, id],
    queryFn: () => tenantService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY }),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) =>
      tenantService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY }),
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY }),
  });
}
