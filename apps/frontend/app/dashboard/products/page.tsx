"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProduct";
import { useCategoryProducts } from "@/hooks/useCategoryProduct";
import { Product } from "@/types/product.type";
import { ProductTable } from "./components/ProductTable";
import {
  ProductFormDialog,
  ProductDetailDialog,
  DeleteProductDialog,
} from "./components/ProductDialog";
import { leadSparkApi } from "@/lib/api/leadspark.api";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(
    undefined
  );

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

  const { data, isLoading, error } = useProducts({
    page,
    limit,
    search: debouncedSearch,
    categoryId: categoryFilter || undefined,
  });

  const { data: categoriesData } = useCategoryProducts({ limit: 100 });
  const categories = categoriesData?.data || [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleCreate = () => {
    setProductToEdit(undefined);
    setFormDialogOpen(true);
  };

  const handleLeadSparkSync = async () => {
    setIsSyncing(true);
    try {
      const result = await leadSparkApi.syncProducts();
      if (result.errors.length === 0) {
        toast.success(`Synced ${result.synced} products to LeadSpark AI`);
      } else {
        toast.warning(
          `Synced ${result.synced} products. ${result.errors.length} failed.`
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "LeadSpark sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setFormDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
  }) => {
    try {
      if (productToEdit) {
        await updateMutation.mutateAsync({
          id: productToEdit._id,
          data,
        });
        toast.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Product created successfully");
      }
      setFormDialogOpen(false);
      setProductToEdit(undefined);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${productToEdit ? "update" : "create"} product`
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      await deleteMutation.mutateAsync(selectedProduct._id);
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value === "all" ? "" : value);
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load products. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleLeadSparkSync} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync to LeadSpark"}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                {pagination
                  ? `Showing ${products.length} of ${pagination.total} products`
                  : "Loading products..."}
              </CardDescription>
            </div>
            <div className="w-[200px]">
              <Select
                value={categoryFilter || "all"}
                onValueChange={handleCategoryFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No products found
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {search || categoryFilter
                  ? "Try adjusting your filters"
                  : "Get started by creating your first product"}
              </p>
              {!search && !categoryFilter && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <ProductTable
                data={products}
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
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              onClick={() => setPage(i + 1)}
                              isActive={page === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
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

      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        product={productToEdit}
        categories={categories}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ProductDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        product={selectedProduct}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
