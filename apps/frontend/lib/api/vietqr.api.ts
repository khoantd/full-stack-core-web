import axiosClient from "@/api/axiosClient";
import { BankInfo, TenantBankAccount, UpsertBankAccountRequest, VietQRGenerateRequest, VietQRResult } from "@/types/bank.type";

export const vietQRApi = {
  getBanks: async (): Promise<BankInfo[]> => {
    const res = await axiosClient.get("/vietqr/banks");
    return res.data;
  },

  generate: async (data: VietQRGenerateRequest): Promise<VietQRResult> => {
    const res = await axiosClient.post("/vietqr/generate", data);
    return res.data;
  },

  // Tenant bank accounts
  getBankAccounts: async (): Promise<TenantBankAccount[]> => {
    const res = await axiosClient.get("/tenants/bank-accounts");
    return res.data;
  },

  upsertBankAccount: async (data: UpsertBankAccountRequest): Promise<TenantBankAccount> => {
    const res = await axiosClient.post("/tenants/bank-accounts", data);
    return res.data;
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    await axiosClient.delete(`/tenants/bank-accounts/${id}`);
  },
};
