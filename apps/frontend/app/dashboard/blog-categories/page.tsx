"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

import { useBlogCategories, useDeleteBlogCategory } from "@/hooks/useBlogCategory";
import type { BlogCategory } from "@/types/blog-category.type";
import {
  BlogCategoryTable,
  BlogCategoryFormDialog,
  BlogCategoryDetailDialog,
  DeleteBlogCategoryDialog,
} from "./components";

export default function BlogCategoriesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selected, setSelected] = useState<BlogCategory | null>(null);
  const [toEdit, setToEdit] = useState<BlogCategory | undefined>(undefined);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error, refetch } = useBlogCategories({
    page,
    limit,
    search: debouncedSearch,
  });

  const deleteMutation = useDeleteBlogCategory();

  const handleFormDialogOpenChange = useCallback((open: boolean) => {
    setFormDialogOpen(open);
    if (!open) setToEdit(undefined);
  }, []);

  const handleCreate = () => { setToEdit(undefined); setFormDialogOpen(true); };
  const handleView = (cat: BlogCategory) => { setSelected(cat); setDetailDialogOpen(true); };
  const handleEdit = (cat: BlogCategory) => { setToEdit(cat); setFormDialogOpen(true); };
  const handleDelete = (cat: BlogCategory) => { setSelected(cat); setDeleteDialogOpen(true); };
  const handleFormSuccess = useCallback(() => { refetch(); }, [refetch]);

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected._id);
      toast.success("Blog category deleted successfully");
      setDeleteDialogOpen(false);
      setSelected(null);
      refetch();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || "Failed to delete blog category");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error loading categories</CardTitle>
            <CardDescription>Please try refreshing the page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const categories = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Categories</h1>
          <p className="text-muted-foreground">Organise your blog posts into categories.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            {pagination
              ? `Showing ${categories.length} of ${pagination.total} categories`
              : "Loading…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <p className="text-lg font-medium text-muted-foreground mb-2">No categories yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? "No categories match your search." : "Create your first blog category to get started."}
              </p>
              {!search && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
              )}
            </div>
          ) : (
            <>
              <BlogCategoryTable
                data={categories}
                actions={{ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }}
                searchValue={search}
                onSearchChange={(v) => setSearch(v)}
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
                      {Array.from({ length: pagination.totalPages as number }, (_, i) => (
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
                          onClick={() => setPage((p) => Math.min(pagination.totalPages as number, p + 1))}
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

      <BlogCategoryFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormDialogOpenChange}
        category={toEdit}
        onSuccess={handleFormSuccess}
      />

      <BlogCategoryDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        category={selected}
      />

      <DeleteBlogCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={selected}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
