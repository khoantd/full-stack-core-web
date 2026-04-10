"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pricingApi } from "@/lib/api/pricing.api";
import type { CreatePricingRequest, PricingQueryParams, UpdatePricingRequest } from "@/types/pricing.type";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";

export const PRICINGS_QUERY_KEY = "pricings";

export function usePricings(params: PricingQueryParams = {}) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const { page = 1, limit = 10, search, status } = params;

  return useQuery({
    queryKey: [PRICINGS_QUERY_KEY, tenantId, page, limit, search, status],
    queryFn: () => pricingApi.getPricings({ page, limit, search, status }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function usePricingById(id: string) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useQuery({
    queryKey: [PRICINGS_QUERY_KEY, tenantId, id],
    queryFn: () => pricingApi.getPricingById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreatePricing() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (data: CreatePricingRequest) => pricingApi.createPricing(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRICINGS_QUERY_KEY, tenantId] }),
  });
}

export function useUpdatePricing() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricingRequest }) =>
      pricingApi.updatePricing(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRICINGS_QUERY_KEY, tenantId] }),
  });
}

export function useDeletePricing() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => pricingApi.deletePricing(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRICINGS_QUERY_KEY, tenantId] }),
  });
}

