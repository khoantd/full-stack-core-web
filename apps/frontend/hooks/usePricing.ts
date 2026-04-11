"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { pricingApi } from "@/lib/api/pricing.api";
import type { CreatePricingRequest, PricingQueryParams, UpdatePricingRequest } from "@/types/pricing.type";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";

export const PRICINGS_QUERY_KEY = "pricings";

export function usePricings(params: PricingQueryParams = {}, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  const { page = 1, limit = 10, search, status } = params;

  return useQuery({
    queryKey: [PRICINGS_QUERY_KEY, tenantId, locale, page, limit, search, status],
    queryFn: () => pricingApi.getPricings({ page, limit, search, status }, locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function usePricing(id: string | null, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [PRICINGS_QUERY_KEY, tenantId, locale, id],
    queryFn: () => pricingApi.getPricingById(id!, locale),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCreatePricing(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: (data: CreatePricingRequest) => pricingApi.createPricing(data, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRICINGS_QUERY_KEY, tenantId] }),
  });
}

export function useUpdatePricing(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricingRequest }) =>
      pricingApi.updatePricing(id, data, locale),
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
