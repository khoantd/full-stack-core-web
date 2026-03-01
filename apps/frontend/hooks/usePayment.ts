import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/payment.api";
import {
  PaymentsQueryParams,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  UpdateStatusRequest,
} from "@/types/payment.type";

export const PAYMENTS_QUERY_KEY = "payments";

export function usePayments(params: PaymentsQueryParams = {}) {
  const { page = 1, limit = 10, search, eventId, status } = params;

  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, page, limit, search, eventId, status],
    queryFn: () => paymentApi.getPayments({ page, limit, search, eventId, status }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function usePayment(id: string | null) {
  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, id],
    queryFn: () => paymentApi.getPaymentById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) =>
      paymentApi.updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) =>
      paymentApi.updatePaymentStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentApi.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
    },
  });
}
