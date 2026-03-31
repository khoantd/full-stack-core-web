import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vietQRApi } from "@/lib/api/vietqr.api";
import { UpsertBankAccountRequest } from "@/types/bank.type";

export const BANKS_QUERY_KEY = "vietqr-banks";
export const BANK_ACCOUNTS_QUERY_KEY = "tenant-bank-accounts";

export function useBanks() {
  return useQuery({
    queryKey: [BANKS_QUERY_KEY],
    queryFn: vietQRApi.getBanks,
    staleTime: Infinity, // bank list never changes
  });
}

export function useBankAccounts() {
  return useQuery({
    queryKey: [BANK_ACCOUNTS_QUERY_KEY],
    queryFn: vietQRApi.getBankAccounts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertBankAccountRequest) => vietQRApi.upsertBankAccount(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BANK_ACCOUNTS_QUERY_KEY] }),
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vietQRApi.deleteBankAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BANK_ACCOUNTS_QUERY_KEY] }),
  });
}
