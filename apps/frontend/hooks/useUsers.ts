"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import type { UsersQueryParams, CreateUserRequest, UpdateUserRequest } from "@/api/types";

export const USERS_QUERY_KEY = "users";
export const ROLES_QUERY_KEY = "roles";

/**
 * Hook to fetch list of users with pagination, search, filter
 */
export function useUsers(params: UsersQueryParams & { enabled?: boolean } = {}) {
  const { page = 1, limit = 10, search, role, enabled = true } = params;

  return useQuery({
    queryKey: [USERS_QUERY_KEY, page, limit, search, role],
    queryFn: () => userService.getUsers({ page, limit, search, role }),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch all roles
 */
export function useRoles() {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: () => userService.getRoles(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(id: string | null) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id, // Only fetch if id is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}
