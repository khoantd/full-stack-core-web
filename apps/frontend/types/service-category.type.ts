export type ServiceCategoryStatus = "Draft" | "Published" | "Archived";

export interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  status: ServiceCategoryStatus;
  sortOrder: number;
  parent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceCategoryRequest {
  name: string;
  slug: string;
  status?: ServiceCategoryStatus;
  sortOrder?: number;
  parent?: string | null;
}

export interface UpdateServiceCategoryRequest {
  name?: string;
  slug?: string;
  status?: ServiceCategoryStatus;
  sortOrder?: number;
  parent?: string | null;
}

export interface ServiceCategoryPagination {
  total: number;
  page: number | "all";
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ServiceCategoriesResponse {
  data: ServiceCategory[];
  pagination: ServiceCategoryPagination;
}

export interface ServiceCategoryQueryParams {
  page?: number | "all";
  limit?: number;
  search?: string;
  status?: ServiceCategoryStatus;
}

