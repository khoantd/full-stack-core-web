export type ServiceStatus = 'Draft' | 'Published' | 'Archived';

export type ServiceContentBlock =
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 | 4 }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'image'; url: string; alt?: string };

export interface Service {
  _id: string;
  title: string;
  description: string;
  image?: string;
  status: ServiceStatus;
  price?: number;
  duration?: string;
  category?: string;
  categoryIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  content?: ServiceContentBlock[];
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
  categoryIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  content?: ServiceContentBlock[];
}

export interface UpdateServiceRequest {
  title?: string;
  description?: string;
  image?: string;
  status?: ServiceStatus;
  price?: number;
  duration?: string;
  category?: string;
  categoryIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  content?: ServiceContentBlock[];
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
  categoryIds?: string[];
}
