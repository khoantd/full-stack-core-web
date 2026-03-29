export interface CategoryProduct {
  _id: string;
  name: string;
  description?: string;
  parent?: { _id: string; name: string } | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryProductRequest {
  name: string;
  description?: string;
  parent?: string;
}

export interface UpdateCategoryProductRequest {
  name?: string;
  description?: string;
  parent?: string | null;
}

export interface CategoryProductsResponse {
  data: CategoryProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CategoryProductQueryParams {
  page?: number | string;
  limit?: number;
  search?: string;
}
