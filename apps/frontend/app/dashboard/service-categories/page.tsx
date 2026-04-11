"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

import { useDeleteServiceCategory, useServiceCategories } from "@/hooks/useServiceCategory";
import type { ServiceCategory } from "@/types/service-category.type";
import { DeleteServiceCategoryDialog, ServiceCategoryDetailDialog, ServiceCategoryFormDialog, ServiceCategoryTable } from "./components";

export default function ServiceCategoriesPage() {
  const t = useTranslations("pages.serviceCategories");
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

  const { data, isLoading, error, refetch } = useServiceCategories({ page, limit, search: debouncedSearch });

  const deleteMutation = useDeleteServiceCategory();

  const handleFormDialogOpenChange = useCallback((open: boolean) => {
    setFormDialogOpen(open);
    if (!open) setToEdit(undefined);
  }, []);

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

  const handleFormSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected._id);
      toast.success(t("deleted"));
      setDeleteDialogOpen(false);
      setSelected(null);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || t("deleteFailed"));
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
            <CardTitle>{t("errorTitle")}</CardTitle>
            <CardDescription>{t("errorSubtitle")}</CardDescription>
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
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("categoriesLabel")}</CardTitle>
          <CardDescription>
            {pagination
              ? t("showing", { count: categories.length, total: pagination.total })
              : t("loading")}
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
              <p className="text-lg font-medium text-muted-foreground mb-2">{t("noYetTitle")}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? t("noYetSearch") : t("noYetSubtitle")}
              </p>
              {!search && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("add")}
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
        onOpenChange={handleFormDialogOpenChange}
        category={toEdit}
        onSuccess={handleFormSuccess}
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
