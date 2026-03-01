import axiosClient from "@/api/axiosClient";
import {
  PaymentsResponse,
  Payment,
  PaymentsQueryParams,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  UpdateStatusRequest,
} from "@/types/payment.type";

export const paymentApi = {
  getPayments: async (params: PaymentsQueryParams = {}): Promise<PaymentsResponse> => {
    const { page = 1, limit = 10, search, eventId, status } = params;
    const queryParams = new URLSearchParams();

    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    if (search) {
      queryParams.append("search", search);
    }

    if (eventId) {
      queryParams.append("eventId", eventId);
    }

    if (status) {
      queryParams.append("status", status);
    }

    const response = await axiosClient.get(`/payments?${queryParams.toString()}`);
    return response.data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await axiosClient.get(`/payments/${id}`);
    return response.data;
  },

  createPayment: async (data: CreatePaymentRequest): Promise<Payment> => {
    const response = await axiosClient.post("/payments", data);
    return response.data;
  },

  updatePayment: async (id: string, data: UpdatePaymentRequest): Promise<Payment> => {
    const response = await axiosClient.put(`/payments/${id}`, data);
    return response.data;
  },

  updatePaymentStatus: async (id: string, data: UpdateStatusRequest): Promise<Payment> => {
    const response = await axiosClient.patch(`/payments/${id}/status`, data);
    return response.data;
  },

  deletePayment: async (id: string): Promise<void> => {
    await axiosClient.delete(`/payments/${id}`);
  },
};
