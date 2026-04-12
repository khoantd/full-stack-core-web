export type BlogCategoryStatus = 'Draft' | 'Published' | 'Archived';

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  status: BlogCategoryStatus;
  sortOrder: number;
  parent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogCategoryRequest {
  name: string;
  slug: string;
  status?: BlogCategoryStatus;
  sortOrder?: number;
  parent?: string | null;
}

export interface UpdateBlogCategoryRequest {
  name?: string;
  slug?: string;
  status?: BlogCategoryStatus;
  sortOrder?: number;
  parent?: string | null;
}

export interface BlogCategoryPagination {
  total: number;
  page: number | 'all';
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogCategoriesResponse {
  data: BlogCategory[];
  pagination: BlogCategoryPagination;
}

export interface BlogCategoryQueryParams {
  page?: number | 'all';
  limit?: number;
  search?: string;
  status?: BlogCategoryStatus;
}
