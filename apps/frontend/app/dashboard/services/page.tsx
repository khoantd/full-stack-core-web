"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServices } from "@/hooks/useService";
import { ServiceTable, ServiceFormDialog, ServiceDetailDialog, DeleteServiceDialog } from "./components";
import type { Service, ServiceStatus } from "@/types/service.type";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function ServicesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchInput, 300);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { data, isLoading, isError, error, refetch } = useServices({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as ServiceStatus) : undefined,
  });

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const handleView = useCallback((s: Service) => { setSelectedService(s); setIsDetailOpen(true); }, []);
  const handleEdit = useCallback((s: Service) => { setSelectedService(s); setIsEditOpen(true); }, []);
  const handleDelete = useCallback((s: Service) => { setSelectedService(s); setIsDeleteOpen(true); }, []);
  const handleSuccess = useCallback(() => { refetch(); }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
            <p className="text-destructive">{error instanceof Error ? error.message : "An error occurred"}</p>
            <Button onClick={() => refetch()} variant="outline">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const services = data?.data ?? [];
  const pagination = data?.pagination;
  const isEmpty = services.length === 0 && !debouncedSearch && statusFilter === "all";
  const isEmptySearch = services.length === 0 && (!!debouncedSearch || statusFilter !== "all");

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <Button variant="secondary" onClick={() => { setSelectedService(null); setIsCreateOpen(true); }}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Add New Service
        </Button>
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
              <div className="rounded-full bg-muted p-4">
                <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">No services yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Create your first service to get started.</p>
              </div>
              <Button onClick={() => { setSelectedService(null); setIsCreateOpen(true); }}>
                <PlusCircledIcon className="mr-2 h-4 w-4" /> Create Service
              </Button>
            </div>
          ) : (
            <>
              <ServiceTable
                data={services}
                actions={{ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
              />
              {isEmptySearch && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">No services found matching your filters</p>
                </div>
              )}
              {pagination && services.length > 0 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} services
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}>
                      <ChevronLeft className="h-4 w-4 mr-1" />Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">Page {pagination.page} of {pagination.totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}>
                      Next<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} service={null} onSuccess={handleSuccess} />
      <ServiceFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} service={selectedService} onSuccess={handleSuccess} />
      <ServiceDetailDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} service={selectedService} />
      <DeleteServiceDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} service={selectedService} onSuccess={handleSuccess} />
    </>
  );
}
