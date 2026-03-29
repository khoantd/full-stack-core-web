// Blog types - matching API response structure
export type BlogStatus = 'Draft' | 'Published' | 'Archived';

export interface Blog {
  _id: string;
  title: string;
  description: string;
  image?: string;
  status: BlogStatus;
  author?: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogVersion {
  _id: string;
  blogId: string;
  title: string;
  description: string;
  image?: string;
  status?: string;
  author?: string;
  versionNumber: number;
  createdAt: string;
}

// Request payload for creating a blog
export interface CreateBlogRequest {
  title: string;
  description: string;
  image?: string;
  status?: BlogStatus;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Request payload for updating a blog
export interface UpdateBlogRequest {
  title?: string;
  description?: string;
  image?: string;
  status?: BlogStatus;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
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
  status?: BlogStatus;
}
