"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeleteTestimonialSection, useTestimonialSections } from "@/hooks/useTestimonialSection";
import type { TestimonialSection, TestimonialSectionStatus } from "@/types/testimonial-section.type";
import { TestimonialSectionTable } from "./components/TestimonialSectionTable";
import {
  DeleteTestimonialSectionDialog,
  TestimonialSectionDetailDialog,
  TestimonialSectionFormDialog,
} from "./components/TestimonialSectionDialog";
import { useTranslations } from "next-intl";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function TestimonialSectionsPage() {
  const t = useTranslations("pages.testimonialSections");
  const tp = useTranslations("pages.testimonialSections.pagination");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchInput, 300);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<TestimonialSection | null>(null);

  const { data, isLoading, isError, error, refetch } = useTestimonialSections({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as TestimonialSectionStatus) : undefined,
  });

  const deleteMutation = useDeleteTestimonialSection();

  const sections = data?.data ?? [];
  const pagination = data?.pagination;

  const isEmpty = useMemo(
    () => sections.length === 0 && !debouncedSearch && statusFilter === "all",
    [sections.length, debouncedSearch, statusFilter],
  );
  const isEmptySearch = useMemo(
    () => sections.length === 0 && (!!debouncedSearch || statusFilter !== "all"),
    [sections.length, debouncedSearch, statusFilter],
  );

  const handleView = useCallback((s: TestimonialSection) => {
    setSelectedSection(s);
    setIsDetailOpen(true);
  }, []);
  const handleEdit = useCallback((s: TestimonialSection) => {
    setSelectedSection(s);
    setIsEditOpen(true);
  }, []);
  const handleDelete = useCallback((s: TestimonialSection) => {
    setSelectedSection(s);
    setIsDeleteOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSection) return;
    try {
      await deleteMutation.mutateAsync(selectedSection._id);
      toast.success(t("deleted"));
      setIsDeleteOpen(false);
      setSelectedSection(null);
      refetch();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || t("deleteFailed"));
    }
  }, [deleteMutation, selectedSection, refetch, t]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
            <p className="text-destructive">
              {error instanceof Error ? error.message : t("loadError")}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              {t("tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedSection(null);
              setIsCreateOpen(true);
            }}
          >
            <PlusCircledIcon className="mr-2 h-4 w-4" /> {t("add")}
          </Button>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="Draft">{t("statusDraft")}</SelectItem>
            <SelectItem value="Published">{t("statusPublished")}</SelectItem>
            <SelectItem value="Archived">{t("statusArchived")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isEmpty ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t("noYetTitle")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("noYetSubtitle")}</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedSection(null);
                  setIsCreateOpen(true);
                }}
              >
                <PlusCircledIcon className="mr-2 h-4 w-4" /> {t("create")}
              </Button>
            </div>
          ) : (
            <>
              <TestimonialSectionTable
                data={sections}
                actions={{ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }}
                searchValue={searchInput}
                onSearchChange={(value) => {
                  setSearchInput(value);
                  setPage(1);
                }}
              />

              {isEmptySearch && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">{t("noMatch")}</p>
                </div>
              )}

              {pagination && sections.length > 0 && pagination.page !== "all" && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    {tp("showing", {
                      from: (pagination.page - 1) * pagination.limit + 1,
                      to: Math.min(pagination.page * pagination.limit, pagination.total),
                      total: pagination.total,
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {tp("previous")}
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {tp("pageOf", { page: pagination.page, totalPages: pagination.totalPages })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      {tp("next")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TestimonialSectionFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        section={null}
        onSuccess={handleFormSuccess}
        variant="create"
      />

      <TestimonialSectionFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        section={selectedSection}
        onSuccess={handleFormSuccess}
        variant="edit"
      />

      <TestimonialSectionDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        section={selectedSection}
      />

      <DeleteTestimonialSectionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        section={selectedSection}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
