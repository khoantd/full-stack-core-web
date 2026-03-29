// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// Role type (from API)
export interface Role {
  _id: string;
  name: string;
}

export interface RolesResponse {
  message: string;
  data: Role[];
  total?: number;
}

// User types - matching API response structure
export interface User {
  _id?: string; // MongoDB ID from API
  id?: string | number; // Legacy support
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  country?: string;
  status?: string;
  plan_name?: string;
  role?: string | Role; // Can be ObjectId string or populated Role object
  uid?: string; // Firebase UID
  securityConfirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Request payload for creating a user
export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string; // Required if no uid
  uid?: string; // Firebase UID (if provided, password not required)
  role?: string; // ObjectId of Role
  securityConfirmed?: boolean;
}

// Request payload for updating a user
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  uid?: string;
  role?: string;
  securityConfirmed?: boolean;
}

// Response for delete operation
export interface DeleteUserResponse {
  message: string;
  id: string;
}

export interface UsersResponse {
  data: User[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  // Legacy support
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface UsersQueryParams {
  page?: number | string; // Can be number or "all"
  limit?: number;
  search?: string;
  role?: string; // ObjectId to filter by role
}

// File Upload types (MinIO)
export interface FileUploadResponse {
  url: string;
}

export interface FileUploadResult {
  url: string; // Full URL with domain prefix
  originalUrl: string; // Original URL from API response
}
