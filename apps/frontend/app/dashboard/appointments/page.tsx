"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/useAppointment";
import type { Appointment } from "@/types/appointment.type";
import { AppointmentTable, AppointmentDialog, AppointmentDetailDialog } from "./components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import type {
  AppointmentStatus,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "@/types/appointment.type";

export default function AppointmentsPage() {
  const t = useTranslations("pages.appointments");
  const tToast = useTranslations("pages.appointments.toasts");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const statusParam: AppointmentStatus | undefined =
    statusFilter === "all" ? undefined : (statusFilter as AppointmentStatus);

  const { data, isLoading, isError, error } = useAppointments({
    page,
    limit,
    search: debouncedSearch,
    status: statusParam,
  });

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const handleCreate = useCallback(() => {
    setSelected(null);
    setIsCreateOpen(true);
  }, []);

  const handleEdit = useCallback((row: Appointment) => {
    setSelected(row);
    setIsEditOpen(true);
  }, []);

  const handleView = useCallback((row: Appointment) => {
    setSelected(row);
    setIsDetailOpen(true);
  }, []);

  const handleDelete = useCallback(
    (row: Appointment) => {
      deleteMutation.mutate(row._id, {
        onSuccess: () => toast.success(tToast("deleted")),
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          toast.error(msg || tToast("deleteFailed"));
        },
      });
    },
    [deleteMutation, tToast]
  );

  const handleCreateSubmit = useCallback(
    (formData: Record<string, unknown>) => {
      createMutation.mutate(formData as unknown as CreateAppointmentRequest, {
        onSuccess: () => {
          toast.success(tToast("created"));
          setIsCreateOpen(false);
        },
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          toast.error(msg || tToast("createFailed"));
        },
      });
    },
    [createMutation, tToast]
  );

  const handleEditSubmit = useCallback(
    (formData: Record<string, unknown>) => {
      if (!selected) return;
      updateMutation.mutate(
        { id: selected._id, data: formData as unknown as UpdateAppointmentRequest },
        {
          onSuccess: () => {
            toast.success(tToast("updated"));
            setIsEditOpen(false);
            setSelected(null);
          },
          onError: (err: unknown) => {
            const msg =
              err && typeof err === "object" && "response" in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            toast.error(msg || tToast("updateFailed"));
          },
        }
      );
    },
    [selected, updateMutation, tToast]
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => {
    if (data?.pagination.hasNextPage) setPage((p) => p + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">{tToast("loadFailed")}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {error instanceof Error ? error.message : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Button onClick={handleCreate} className="cursor-pointer">
          <IconPlus className="mr-2 h-4 w-4" />
          {t("addNew")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="confirmed">{t("status.confirmed")}</SelectItem>
                <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <AppointmentTable
            appointments={rows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                {t("pagination.showing", {
                  count: rows.length,
                  total: pagination.total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={handlePrev}
                  disabled={!pagination.hasPrevPage}
                >
                  {t("pagination.previous")}
                </Button>
                <span className="text-sm">
                  {t("pagination.pageOf", {
                    page: String(pagination.page),
                    totalPages: String(pagination.totalPages),
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={handleNext}
                  disabled={!pagination.hasNextPage}
                >
                  {t("pagination.next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
      />

      <AppointmentDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        appointment={selected}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      <AppointmentDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        appointment={selected}
      />
    </div>
  );
}
