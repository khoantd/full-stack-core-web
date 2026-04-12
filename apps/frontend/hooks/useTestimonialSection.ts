"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { testimonialSectionApi } from "@/lib/api/testimonial-section.api";
import type {
  CreateTestimonialSectionRequest,
  TestimonialSectionQueryParams,
  UpdateTestimonialSectionRequest,
} from "@/types/testimonial-section.type";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";

export const TESTIMONIAL_SECTIONS_QUERY_KEY = "testimonial-sections";

export function useTestimonialSections(
  params: TestimonialSectionQueryParams = {},
  options?: { locale?: string },
) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  const { page = 1, limit = 10, search, status } = params;

  return useQuery({
    queryKey: [TESTIMONIAL_SECTIONS_QUERY_KEY, tenantId, locale, page, limit, search, status],
    queryFn: () => testimonialSectionApi.getTestimonialSections({ page, limit, search, status }, locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useTestimonialSection(id: string | null, options?: { locale?: string }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useQuery({
    queryKey: [TESTIMONIAL_SECTIONS_QUERY_KEY, tenantId, locale, id],
    queryFn: () => testimonialSectionApi.getTestimonialSectionById(id!, locale),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateTestimonialSection(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: (data: CreateTestimonialSectionRequest) =>
      testimonialSectionApi.createTestimonialSection(data, locale),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TESTIMONIAL_SECTIONS_QUERY_KEY, tenantId] }),
  });
}

export function useUpdateTestimonialSection(options?: { locale?: string }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestimonialSectionRequest }) =>
      testimonialSectionApi.updateTestimonialSection(id, data, locale),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TESTIMONIAL_SECTIONS_QUERY_KEY, tenantId] }),
  });
}

export function useDeleteTestimonialSection() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => testimonialSectionApi.deleteTestimonialSection(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TESTIMONIAL_SECTIONS_QUERY_KEY, tenantId] }),
  });
}
