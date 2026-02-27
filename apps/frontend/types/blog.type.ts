// Blog types - matching API response structure
export interface Blog {
  _id: string;
  title: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Request payload for creating a blog
export interface CreateBlogRequest {
  title: string;
  description: string;
  image?: string;
}

// Request payload for updating a blog
export interface UpdateBlogRequest {
  title?: string;
  description?: string;
  image?: string;
}

// Response for delete operation
export interface DeleteBlogResponse {
  message: string;
  id: string;
}

// Pagination metadata
export interface BlogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Response for list operation
export interface BlogsResponse {
  data: Blog[];
  pagination: BlogPagination;
}

// Query parameters for listing blogs
export interface BlogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
