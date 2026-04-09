import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryProductApi } from "@/lib/api/category-product.api";
import {
  CreateCategoryProductRequest,
  UpdateCategoryProductRequest,
  CategoryProductQueryParams,
} from "@/types/category-product.type";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";

export const CATEGORY_PRODUCTS_QUERY_KEY = "categoryProducts";

export function useCategoryProducts(params?: CategoryProductQueryParams) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useQuery({
    queryKey: [
      CATEGORY_PRODUCTS_QUERY_KEY,
      tenantId,
      params?.page,
      params?.limit,
      params?.search,
    ],
    queryFn: () => categoryProductApi.getCategoryProducts(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCategoryProductById(id: string) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useQuery({
    queryKey: [CATEGORY_PRODUCTS_QUERY_KEY, tenantId, id],
    queryFn: () => categoryProductApi.getCategoryProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateCategoryProduct() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (data: CreateCategoryProductRequest) =>
      categoryProductApi.createCategoryProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_PRODUCTS_QUERY_KEY, tenantId],
      });
    },
  });
}

export function useUpdateCategoryProduct() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryProductRequest;
    }) => categoryProductApi.updateCategoryProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_PRODUCTS_QUERY_KEY, tenantId],
      });
    },
  });
}

export function useDeleteCategoryProduct() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => categoryProductApi.deleteCategoryProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_PRODUCTS_QUERY_KEY, tenantId],
      });
    },
  });
}
