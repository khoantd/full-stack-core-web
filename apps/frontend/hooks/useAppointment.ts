import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentApi } from "@/lib/api/appointment.api";
import type {
  AppointmentsQueryParams,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "@/types/appointment.type";

export const APPOINTMENTS_QUERY_KEY = "appointments";

export function useAppointments(params: AppointmentsQueryParams = {}) {
  const { page = 1, limit = 10, search, status, from, to } = params;

  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, page, limit, search, status, from, to],
    queryFn: () => appointmentApi.getAppointments({ page, limit, search, status, from, to }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAppointment(id: string | null) {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => appointmentApi.getAppointmentById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentApi.createAppointment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] }),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentApi.updateAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] }),
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentApi.deleteAppointment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] }),
  });
}
