"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePricing, useDeletePricing, usePricings, useUpdatePricing } from "@/hooks/usePricing";
import type { Pricing, PricingStatus, CreatePricingRequest, UpdatePricingRequest } from "@/types/pricing.type";
import { PricingTable } from "./components/PricingTable";
import { DeletePricingDialog, PricingDetailDialog, PricingFormDialog } from "./components/PricingDialog";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function PricingsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchInput, 300);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);

  const { data, isLoading, isError, error, refetch } = usePricings({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as PricingStatus) : undefined,
  });

  const createMutation = useCreatePricing();
  const updateMutation = useUpdatePricing();
  const deleteMutation = useDeletePricing();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const pricings = data?.data ?? [];
  const pagination = data?.pagination;

  const isEmpty = useMemo(
    () => pricings.length === 0 && !debouncedSearch && statusFilter === "all",
    [pricings.length, debouncedSearch, statusFilter],
  );
  const isEmptySearch = useMemo(
    () => pricings.length === 0 && (!!debouncedSearch || statusFilter !== "all"),
    [pricings.length, debouncedSearch, statusFilter],
  );

  const handleView = useCallback((p: Pricing) => { setSelectedPricing(p); setIsDetailOpen(true); }, []);
  const handleEdit = useCallback((p: Pricing) => { setSelectedPricing(p); setIsEditOpen(true); }, []);
  const handleDelete = useCallback((p: Pricing) => { setSelectedPricing(p); setIsDeleteOpen(true); }, []);

  const handleCreateSubmit = useCallback(async (payload: CreatePricingRequest | UpdatePricingRequest) => {
    try {
      await createMutation.mutateAsync(payload as CreatePricingRequest);
      toast.success("Pricing created successfully");
      setIsCreateOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create pricing");
    }
  }, [createMutation, refetch]);

  const handleEditSubmit = useCallback(async (payload: UpdatePricingRequest) => {
    if (!selectedPricing) return;
    try {
      await updateMutation.mutateAsync({ id: selectedPricing._id, data: payload });
      toast.success("Pricing updated successfully");
      setIsEditOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update pricing");
    }
  }, [selectedPricing, updateMutation, refetch]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedPricing) return;
    try {
      await deleteMutation.mutateAsync(selectedPricing._id);
      toast.success("Pricing deleted successfully");
      setIsDeleteOpen(false);
      setSelectedPricing(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete pricing");
    }
  }, [deleteMutation, selectedPricing, refetch]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pricings</h1>
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading pricings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pricings</h1>
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
            <p className="text-destructive">{error instanceof Error ? error.message : "An error occurred"}</p>
            <Button onClick={() => refetch()} variant="outline">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pricings</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => { setSelectedPricing(null); setIsCreateOpen(true); }}
          >
            <PlusCircledIcon className="mr-2 h-4 w-4" /> Add Pricing
          </Button>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isEmpty ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No pricings yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Create your first pricing catalog entry to get started.</p>
              </div>
              <Button onClick={() => { setSelectedPricing(null); setIsCreateOpen(true); }}>
                <PlusCircledIcon className="mr-2 h-4 w-4" /> Create Pricing
              </Button>
            </div>
          ) : (
            <>
              <PricingTable
                data={pricings}
                actions={{ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
              />

              {isEmptySearch && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">No pricings found matching your filters</p>
                </div>
              )}

              {pagination && pricings.length > 0 && pagination.page !== "all" && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} pricings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <PricingFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        pricing={null}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        variant="create"
      />

      <PricingFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        pricing={selectedPricing}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        variant="edit"
      />

      <PricingDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        pricing={selectedPricing}
      />

      <DeletePricingDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        pricing={selectedPricing}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

