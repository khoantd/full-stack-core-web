import axiosClient from "@/api/axiosClient";
import type {
  UsersResponse,
  UsersQueryParams,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserResponse,
  RolesResponse,
} from "@/api/types";

export const userService = {
  /**
   * Get list of users with pagination, search, and filter
   */
  getUsers: async (params: UsersQueryParams = {}): Promise<UsersResponse> => {
    const { page = 1, limit = 10, search, role } = params;
    const response = await axiosClient.get<UsersResponse>("/users", {
      params: { page, limit, search, role },
    });
    return response.data;
  },

  /**
   * Get all roles
   */
  getRoles: async (): Promise<RolesResponse> => {
    const response = await axiosClient.get<RolesResponse>("/users/roles");
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await axiosClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (Admin endpoint - requires auth)
   */
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await axiosClient.post<User>("/users", data);
    return response.data;
  },

  /**
   * Update an existing user
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await axiosClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: string): Promise<DeleteUserResponse> => {
    const response = await axiosClient.delete<DeleteUserResponse>(`/users/${id}`);
    return response.data;
  },
};
