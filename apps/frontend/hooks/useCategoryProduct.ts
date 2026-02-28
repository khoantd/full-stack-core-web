import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryProductApi } from "@/lib/api/category-product.api";
import {
  CreateCategoryProductRequest,
  UpdateCategoryProductRequest,
  CategoryProductQueryParams,
} from "@/types/category-product.type";

export const CATEGORY_PRODUCTS_QUERY_KEY = "categoryProducts";

export function useCategoryProducts(params?: CategoryProductQueryParams) {
  return useQuery({
    queryKey: [
      CATEGORY_PRODUCTS_QUERY_KEY,
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
  return useQuery({
    queryKey: [CATEGORY_PRODUCTS_QUERY_KEY, id],
    queryFn: () => categoryProductApi.getCategoryProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateCategoryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryProductRequest) =>
      categoryProductApi.createCategoryProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_PRODUCTS_QUERY_KEY],
      });
    },
  });
}

export function useUpdateCategoryProduct() {
  const queryClient = useQueryClient();
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
        queryKey: [CATEGORY_PRODUCTS_QUERY_KEY],
      });
    },
  });
}

export function useDeleteCategoryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryProductApi.deleteCategoryProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_PRODUCTS_QUERY_KEY],
      });
    },
  });
}
