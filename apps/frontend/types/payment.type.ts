export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VIET_QR = 'VIET_QR',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface VietQRSnapshot {
  bankCode: string;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
  qrString: string;
}

export interface PaymentEvent {
  _id: string;
  title: string;
  price: number;
}

export interface Payment {
  _id: string;
  tenantId?: string;
  event: PaymentEvent | string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  vietQR?: VietQRSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPagination {
  total: number;
  page: number | string;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaymentsResponse {
  data: Payment[];
  pagination: PaymentPagination;
}

export interface PaymentsQueryParams {
  page?: number | string;
  limit?: number;
  search?: string;
  eventId?: string;
  status?: PaymentStatus;
}

export interface CreatePaymentRequest {
  event: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status?: PaymentStatus;
  transactionId?: string;
}

export interface UpdatePaymentRequest {
  event?: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  transactionId?: string;
}

export interface UpdateStatusRequest {
  status: PaymentStatus;
}
