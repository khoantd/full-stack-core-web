import axiosClient from "@/api/axiosClient";
import type {
  AppointmentsResponse,
  Appointment,
  AppointmentsQueryParams,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "@/types/appointment.type";

export const appointmentApi = {
  getAppointments: async (params: AppointmentsQueryParams = {}): Promise<AppointmentsResponse> => {
    const { page = 1, limit = 10, search, status, from, to } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));
    if (search) queryParams.append("search", search);
    if (status) queryParams.append("status", status);
    if (from) queryParams.append("from", from);
    if (to) queryParams.append("to", to);
    const response = await axiosClient.get<AppointmentsResponse>(`/appointments?${queryParams.toString()}`);
    return response.data;
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await axiosClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await axiosClient.post<Appointment>("/appointments", data);
    return response.data;
  },

  updateAppointment: async (id: string, data: UpdateAppointmentRequest): Promise<Appointment> => {
    const response = await axiosClient.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    await axiosClient.delete(`/appointments/${id}`);
  },
};
