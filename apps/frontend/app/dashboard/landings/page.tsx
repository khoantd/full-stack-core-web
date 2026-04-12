"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLandingPages, useDeleteLandingPage } from "@/hooks/useLandingPages";
import { useFeatureEnabled } from "@/hooks/useFeatureEnabled";
import type { LandingPage, LandingPageStatus } from "@/types/landing.type";
import { LandingTable, LandingEditorDialog } from "./components";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function LandingsPage() {
  const t = useTranslations("pages.landings");
  const tp = useTranslations("pages.landings.pagination");
  const landingFeature = useFeatureEnabled("landingPages");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchInput, 300);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LandingPage | null>(null);

  const { data, isLoading, isError, error, refetch } = useLandingPages({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as LandingPageStatus) : undefined,
  });

  const deleteMutation = useDeleteLandingPage();

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  const isEmpty = useMemo(
    () => rows.length === 0 && !debouncedSearch && statusFilter === "all",
    [rows.length, debouncedSearch, statusFilter],
  );
  const isEmptySearch = useMemo(
    () => rows.length === 0 && (!!debouncedSearch || statusFilter !== "all"),
    [rows.length, debouncedSearch, statusFilter],
  );

  const openCreate = useCallback(() => {
    setEditingId(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((p: LandingPage) => {
    setEditingId(p._id);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(t("deleted"));
      setDeleteTarget(null);
      refetch();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast.error(typeof message === "string" ? message : t("deleteFailed"));
    }
  }, [deleteMutation, deleteTarget, refetch, t]);

  if (!landingFeature) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Card>
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{t("featureDisabled")}</p>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href="/dashboard/settings/features">{t("goToFeatures")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    const message =
      (error as { message?: string })?.message ?? t("tryAgain");
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Button onClick={openCreate} className="cursor-pointer">
          <PlusCircledIcon className="mr-2 size-4" />
          {t("addNew")}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium">{t("noYetTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">{t("noYetSubtitle")}</p>
              <Button className="mt-4 cursor-pointer" onClick={openCreate}>
                <PlusCircledIcon className="mr-2 size-4" />
                {t("create")}
              </Button>
            </div>
          ) : isEmptySearch ? (
            <p className="py-8 text-center text-muted-foreground">{t("noMatch")}</p>
          ) : (
            <LandingTable
              data={rows}
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              actions={{
                onEdit: openEdit,
                onDelete: setDeleteTarget,
              }}
            />
          )}

          {pagination && pagination.totalPages > 1 && !isEmpty && !isEmptySearch && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {tp("showing", {
                  from: (pagination.page - 1) * pagination.limit + 1,
                  to: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {tp("pageOf", { page: pagination.page, totalPages: pagination.totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LandingEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        landingId={editingId}
        onSaved={() => refetch()}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? t("deleteDescription", { title: deleteTarget.title }) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
