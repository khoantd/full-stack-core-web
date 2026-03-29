import axiosClient from "@/api/axiosClient";
import { AuditLogsResponse, AuditLogQueryParams } from "@/types/audit-log.type";

export const auditLogApi = {
  getAuditLogs: async (params?: AuditLogQueryParams): Promise<AuditLogsResponse> => {
    const response = await axiosClient.get<AuditLogsResponse>("/audit-logs", { params });
    return response.data;
  },

  exportCsv: async (params?: Omit<AuditLogQueryParams, "page" | "limit">): Promise<Blob> => {
    const response = await axiosClient.get("/audit-logs/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
