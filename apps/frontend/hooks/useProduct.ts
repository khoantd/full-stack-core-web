import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product.api";
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from "@/types/product.type";
import { getStoredToken } from "@/api/axiosClient";
import { getTenantIdFromToken } from "@/lib/jwt";

export const PRODUCTS_QUERY_KEY = "products";

export function useProducts(params?: ProductQueryParams) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, tenantId, params?.page, params?.limit, params?.search, params?.categoryId],
    queryFn: () => productApi.getProducts(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useProductById(id: string) {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, tenantId, id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useLowStockProducts() {
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, tenantId, "low-stock"],
    queryFn: () => productApi.getLowStockProducts(),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productApi.createProduct(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, tenantId] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productApi.updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, tenantId] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, tenantId] }),
  });
}

export function useBulkImportProducts() {
  const queryClient = useQueryClient();
  const tenantId = getTenantIdFromToken(getStoredToken() ?? "") ?? "";
  return useMutation({
    mutationFn: (products: CreateProductRequest[]) => productApi.bulkImport(products),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, tenantId] }),
  });
}
