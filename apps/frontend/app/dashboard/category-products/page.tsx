"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategoryProducts,
  useCreateCategoryProduct,
  useUpdateCategoryProduct,
  useDeleteCategoryProduct,
} from "@/hooks/useCategoryProduct";
import { CategoryProduct } from "@/types/category-product.type";
import { CategoryProductTable } from "./components/CategoryProductTable";
import {
  CategoryProductFormDialog,
  CategoryProductDetailDialog,
  DeleteCategoryProductDialog,
} from "./components/CategoryProductDialog";

export default function CategoryProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedCategoryProduct, setSelectedCategoryProduct] =
    useState<CategoryProduct | null>(null);
  const [categoryProductToEdit, setCategoryProductToEdit] =
    useState<CategoryProduct | undefined>(undefined);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data, isLoading, error } = useCategoryProducts({
    page,
    limit,
    search: debouncedSearch,
  });

  const createMutation = useCreateCategoryProduct();
  const updateMutation = useUpdateCategoryProduct();
  const deleteMutation = useDeleteCategoryProduct();

  const handleCreate = () => {
    setCategoryProductToEdit(undefined);
    setFormDialogOpen(true);
  };

  const handleView = (categoryProduct: CategoryProduct) => {
    setSelectedCategoryProduct(categoryProduct);
    setDetailDialogOpen(true);
  };

  const handleEdit = (categoryProduct: CategoryProduct) => {
    setCategoryProductToEdit(categoryProduct);
    setFormDialogOpen(true);
  };

  const handleDelete = (categoryProduct: CategoryProduct) => {
    setSelectedCategoryProduct(categoryProduct);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      if (categoryProductToEdit) {
        await updateMutation.mutateAsync({
          id: categoryProductToEdit._id,
          data,
        });
        toast.success("Category updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Category created successfully");
      }
      setFormDialogOpen(false);
      setCategoryProductToEdit(undefined);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${categoryProductToEdit ? "update" : "create"} category`
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategoryProduct) return;

    try {
      await deleteMutation.mutateAsync(selectedCategoryProduct._id);
      toast.success("Category deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedCategoryProduct(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete category"
      );
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load categories. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const categoryProducts = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Category Products
          </h1>
          <p className="text-muted-foreground">
            Manage your product categories
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            {pagination
              ? `Showing ${categoryProducts.length} of ${pagination.total} categories`
              : "Loading categories..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No categories found
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {search
                  ? "Try adjusting your search"
                  : "Get started by creating your first category"}
              </p>
              {!search && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>
          ) : (
            <>
              <CategoryProductTable
                data={categoryProducts}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchValue={search}
                onSearchChange={handleSearchChange}
              />
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={
                            !pagination.hasPrevPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setPage(i + 1)}
                            isActive={page === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage((p) =>
                              Math.min(pagination.totalPages, p + 1)
                            )
                          }
                          className={
                            !pagination.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CategoryProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        categoryProduct={categoryProductToEdit}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <CategoryProductDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        categoryProduct={selectedCategoryProduct}
      />

      <DeleteCategoryProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryProduct={selectedCategoryProduct}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
