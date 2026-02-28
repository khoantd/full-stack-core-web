export interface CategoryProduct {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryProductRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryProductRequest {
  name?: string;
  description?: string;
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
  page?: number;
  limit?: number;
  search?: string;
}
