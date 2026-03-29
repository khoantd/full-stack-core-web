export interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId?: string;
  diff?: Record<string, any>;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AuditLogQueryParams {
  page?: number | string;
  limit?: number;
  userId?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
}
