export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  isPublished: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPagination {
  total: number;
  page: number | string;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EventsResponse {
  data: Event[];
  pagination: EventPagination;
}

export interface EventsQueryParams {
  page?: number | string;
  limit?: number;
  search?: string;
  isPublished?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  isPublished?: boolean;
  image?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  isPublished?: boolean;
  image?: string;
}
