import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "@/lib/api/audit-log.api";
import { AuditLogQueryParams } from "@/types/audit-log.type";

export const AUDIT_LOG_QUERY_KEY = "audit-logs";

export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: [AUDIT_LOG_QUERY_KEY, params],
    queryFn: () => auditLogApi.getAuditLogs(params),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
