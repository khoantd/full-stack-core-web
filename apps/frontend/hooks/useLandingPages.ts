'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { landingApi } from '@/lib/api/landing.api';
import type {
  CreateLandingPageRequest,
  LandingPagesQueryParams,
  UpdateLandingPageRequest,
} from '@/types/landing.type';
import { getStoredToken } from '@/api/axiosClient';
import { getTenantIdFromToken } from '@/lib/jwt';
import { useLocale } from 'next-intl';

export const LANDINGS_QUERY_KEY = 'landing-pages';

export function useLandingPages(params: LandingPagesQueryParams = {}, options?: { locale?: string }) {
  const { page = 1, limit = 10, search, status } = params;
  const tenantId = getTenantIdFromToken(getStoredToken() ?? '') ?? '';
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;

  return useQuery({
    queryKey: [LANDINGS_QUERY_KEY, tenantId, locale, page, limit, search, status],
    queryFn: () => landingApi.getLandingPages({ page, limit, search, status }, locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useLandingPage(id: string | null, options?: { locale?: string; enabled?: boolean }) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? '') ?? '';
  const activeLocale = useLocale();
  const locale = options?.locale ?? activeLocale;
  const enabled = options?.enabled !== false && !!id;

  return useQuery({
    queryKey: [LANDINGS_QUERY_KEY, tenantId, locale, id],
    queryFn: () => landingApi.getLandingPageById(id!, locale),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? '') ?? '';

  return useMutation({
    mutationFn: ({
      data,
      locale,
    }: {
      data: CreateLandingPageRequest;
      locale?: string;
    }) => landingApi.createLandingPage(data, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [LANDINGS_QUERY_KEY, tenantId] }),
  });
}

export function useUpdateLandingPage() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? '') ?? '';

  return useMutation({
    mutationFn: ({
      id,
      data,
      locale,
    }: {
      id: string;
      data: UpdateLandingPageRequest;
      locale?: string;
    }) => landingApi.updateLandingPage(id, data, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [LANDINGS_QUERY_KEY, tenantId] }),
  });
}

export function useDeleteLandingPage() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? '') ?? '';

  return useMutation({
    mutationFn: (id: string) => landingApi.deleteLandingPage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [LANDINGS_QUERY_KEY, tenantId] }),
  });
}
