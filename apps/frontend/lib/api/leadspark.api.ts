import axiosClient from "@/api/axiosClient";

export interface LeadSparkSyncResult {
  synced: number;
  errors: { productId: string; name: string; message: string }[];
}

export const leadSparkApi = {
  syncProducts: async (): Promise<LeadSparkSyncResult> => {
    const response = await axiosClient.post<LeadSparkSyncResult>("/leadspark/sync");
    return response.data;
  },
};
