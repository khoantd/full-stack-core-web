"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

import { useCreateServiceCategory, useDeleteServiceCategory, useServiceCategories, useUpdateServiceCategory } from "@/hooks/useServiceCategory";
import type { ServiceCategory } from "@/types/service-category.type";
import { DeleteServiceCategoryDialog, ServiceCategoryDetailDialog, ServiceCategoryFormDialog, ServiceCategoryTable } from "./components";
import type { ServiceCategoryFormValues } from "./components/ServiceCategoryForm";

export default function ServiceCategoriesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selected, setSelected] = useState<ServiceCategory | null>(null);
  const [toEdit, setToEdit] = useState<ServiceCategory | undefined>(undefined);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error } = useServiceCategories({ page, limit, search: debouncedSearch });

  const createMutation = useCreateServiceCategory();
  const updateMutation = useUpdateServiceCategory();
  const deleteMutation = useDeleteServiceCategory();

  const handleCreate = () => {
    setToEdit(undefined);
    setFormDialogOpen(true);
  };

  const handleView = (cat: ServiceCategory) => {
    setSelected(cat);
    setDetailDialogOpen(true);
  };

  const handleEdit = (cat: ServiceCategory) => {
    setToEdit(cat);
    setFormDialogOpen(true);
  };

  const handleDelete = (cat: ServiceCategory) => {
    setSelected(cat);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (values: ServiceCategoryFormValues) => {
    try {
      const payload = { ...values, sortOrder: Number(values.sortOrder) };
      if (toEdit) {
        await updateMutation.mutateAsync({ id: toEdit._id, data: payload });
        toast.success("Service category updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Service category created successfully");
      }
      setFormDialogOpen(false);
      setToEdit(undefined);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `Failed to ${toEdit ? "update" : "create"} service category`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected._id);
      toast.success("Service category deleted successfully");
      setDeleteDialogOpen(false);
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete service category");
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
            <CardDescription>Failed to load service categories. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const categories = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Categories</h1>
          <p className="text-muted-foreground">Manage your service categories</p>
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
            {pagination ? `Showing ${categories.length} of ${pagination.total} categories` : "Loading categories..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p className="text-lg font-medium text-muted-foreground mb-2">No categories found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? "Try adjusting your search" : "Get started by creating your first service category"}
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
              <ServiceCategoryTable
                data={categories}
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
                          className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                          className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
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

      <ServiceCategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        category={toEdit}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ServiceCategoryDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        category={selected}
      />

      <DeleteServiceCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={selected}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

