"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  usePayments,
  useCreatePayment,
  useUpdatePayment,
  useUpdatePaymentStatus,
  useDeletePayment,
} from "@/hooks/usePayment";
import { useEvents } from "@/hooks/useEvent";
import { Payment, PaymentStatus } from "@/types/payment.type";
import {
  PaymentTable,
  PaymentDialog,
  PaymentDetailDialog,
} from "./components";
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

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const limit = 10;

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Prepare query params
  const status = statusFilter === "all" ? undefined : (statusFilter as PaymentStatus);
  const eventId = eventFilter === "all" ? undefined : eventFilter;

  const { data, isLoading, isError, error } = usePayments({
    page,
    limit,
    search: debouncedSearch,
    status,
    eventId,
  });

  // Fetch all events for the dropdown filter and form
  const { data: eventsData, isLoading: isEventsLoading } = useEvents({
    page: "all",
  });

  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const updateStatusMutation = useUpdatePaymentStatus();
  const deleteMutation = useDeletePayment();

  const events = eventsData?.data || [];

  const handleCreate = useCallback(() => {
    setSelectedPayment(null);
    setIsCreateDialogOpen(true);
  }, []);

  const handleEdit = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditDialogOpen(true);
  }, []);

  const handleView = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (payment: Payment) => {
      deleteMutation.mutate(payment._id, {
        onSuccess: () => {
          toast.success("Payment deleted successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to delete payment");
        },
      });
    },
    [deleteMutation]
  );

  const handleStatusChange = useCallback(
    (payment: Payment, newStatus: PaymentStatus) => {
      updateStatusMutation.mutate(
        {
          id: payment._id,
          data: { status: newStatus },
        },
        {
          onSuccess: () => {
            toast.success(`Payment status updated to ${newStatus}`);
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || "Failed to update payment status"
            );
          },
        }
      );
    },
    [updateStatusMutation]
  );

  const handleCreateSubmit = useCallback(
    (formData: any) => {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Payment created successfully");
          setIsCreateDialogOpen(false);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to create payment"
          );
        },
      });
    },
    [createMutation]
  );

  const handleEditSubmit = useCallback(
    (formData: any) => {
      if (!selectedPayment) return;

      updateMutation.mutate(
        {
          id: selectedPayment._id,
          data: formData,
        },
        {
          onSuccess: () => {
            toast.success("Payment updated successfully");
            setIsEditDialogOpen(false);
            setSelectedPayment(null);
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || "Failed to update payment"
            );
          },
        }
      );
    },
    [selectedPayment, updateMutation]
  );

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  // Loading state
  if (isLoading || isEventsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
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

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-500">Failed to load payments</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error?.message || "An error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payments = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <Button onClick={handleCreate}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={PaymentStatus.SUCCESS}>Success</SelectItem>
                <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <PaymentTable
            payments={payments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
            isLoading={
              updateMutation.isPending ||
              updateStatusMutation.isPending ||
              deleteMutation.isPending
            }
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {payments.length} of {pagination.total} payments
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PaymentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        events={events}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
      />

      <PaymentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        payment={selectedPayment}
        events={events}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      <PaymentDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        payment={selectedPayment}
      />
    </div>
  );
}
