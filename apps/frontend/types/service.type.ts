export type ServiceStatus = 'Draft' | 'Published' | 'Archived';

export interface Service {
  _id: string;
  title: string;
  description: string;
  image?: string;
  status: ServiceStatus;
  price?: number;
  duration?: string;
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  image?: string;
  status?: ServiceStatus;
  price?: number;
  duration?: string;
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateServiceRequest {
  title?: string;
  description?: string;
  image?: string;
  status?: ServiceStatus;
  price?: number;
  duration?: string;
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface DeleteServiceResponse {
  message: string;
  id: string;
}

export interface ServicePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ServicesResponse {
  data: Service[];
  pagination: ServicePagination;
}

export interface ServicesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ServiceStatus;
  category?: string;
}
