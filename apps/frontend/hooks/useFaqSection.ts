"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { faqSectionApi } from "@/lib/api/faq-section.api";
import type {
  CreateFaqSectionRequest,
  FaqSectionQueryParams,
  UpdateFaqSectionRequest,
} from "@/types/faq-section.type";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";

export const FAQ_SECTIONS_QUERY_KEY = "faq-sections";

export function useFaqSections(params: FaqSectionQueryParams = {}, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  const { page = 1, limit = 10, search, status } = params;

  return useQuery({
    queryKey: [FAQ_SECTIONS_QUERY_KEY, tenantId, locale, page, limit, search, status],
    queryFn: () => faqSectionApi.getFaqSections({ page, limit, search, status }, locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useFaqSection(id: string | null, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [FAQ_SECTIONS_QUERY_KEY, tenantId, locale, id],
    queryFn: () => faqSectionApi.getFaqSectionById(id!, locale),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateFaqSection(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: (data: CreateFaqSectionRequest) => faqSectionApi.createFaqSection(data, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FAQ_SECTIONS_QUERY_KEY, tenantId] }),
  });
}

export function useUpdateFaqSection(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFaqSectionRequest }) =>
      faqSectionApi.updateFaqSection(id, data, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FAQ_SECTIONS_QUERY_KEY, tenantId] }),
  });
}

export function useDeleteFaqSection() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => faqSectionApi.deleteFaqSection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FAQ_SECTIONS_QUERY_KEY, tenantId] }),
  });
}
