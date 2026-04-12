export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type AppointmentSource = "dashboard" | "public" | "integration";

export interface AppointmentCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface Appointment {
  _id: string;
  tenantId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  customer: AppointmentCustomer;
  notes?: string;
  source: AppointmentSource;
  serviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentsPagination {
  total: number;
  page: number | string;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AppointmentsResponse {
  data: Appointment[];
  pagination: AppointmentsPagination;
}

export interface AppointmentsQueryParams {
  page?: number | string;
  limit?: number;
  search?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export interface CreateAppointmentRequest {
  title: string;
  startAt: string;
  endAt: string;
  customer: AppointmentCustomer;
  notes?: string;
  status?: AppointmentStatus;
  serviceId?: string;
}

export interface UpdateAppointmentRequest {
  title?: string;
  startAt?: string;
  endAt?: string;
  customer?: AppointmentCustomer;
  notes?: string;
  status?: AppointmentStatus;
  serviceId?: string;
}

export interface RequestPublicAppointmentPayload {
  tenantSlug: string;
  title?: string;
  startAt: string;
  endAt: string;
  customer: AppointmentCustomer;
  notes?: string;
}
