"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks/useEvent";
import { Event } from "@/types/event.type";
import {
  EventTable,
  EventDialog,
  EventDetailDialog,
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

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [publishFilter, setPublishFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Prepare query params
  const isPublished =
    publishFilter === "all"
      ? undefined
      : publishFilter === "published"
      ? true
      : false;

  const { data, isLoading, isError, error } = useEvents({
    page,
    limit,
    search: debouncedSearch,
    isPublished,
  });

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const handleCreate = useCallback(() => {
    setSelectedEvent(null);
    setIsCreateDialogOpen(true);
  }, []);

  const handleEdit = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  }, []);

  const handleView = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsDetailDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (event: Event) => {
      deleteMutation.mutate(event._id, {
        onSuccess: () => {
          toast.success("Event deleted successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to delete event");
        },
      });
    },
    [deleteMutation]
  );

  const handleTogglePublish = useCallback(
    (event: Event) => {
      updateMutation.mutate(
        {
          id: event._id,
          data: { isPublished: !event.isPublished },
        },
        {
          onSuccess: () => {
            toast.success(
              `Event ${!event.isPublished ? "published" : "unpublished"} successfully`
            );
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || "Failed to update event"
            );
          },
        }
      );
    },
    [updateMutation]
  );

  const handleCreateSubmit = useCallback(
    (formData: any) => {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Event created successfully");
          setIsCreateDialogOpen(false);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to create event"
          );
        },
      });
    },
    [createMutation]
  );

  const handleEditSubmit = useCallback(
    (formData: any) => {
      if (!selectedEvent) return;

      updateMutation.mutate(
        {
          id: selectedEvent._id,
          data: formData,
        },
        {
          onSuccess: () => {
            toast.success("Event updated successfully");
            setIsEditDialogOpen(false);
            setSelectedEvent(null);
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || "Failed to update event"
            );
          },
        }
      );
    },
    [selectedEvent, updateMutation]
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
  if (isLoading) {
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
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-500">Failed to load events</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error?.message || "An error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const events = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <Button onClick={handleCreate}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={publishFilter} onValueChange={setPublishFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <EventTable
            events={events}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onTogglePublish={handleTogglePublish}
            isLoading={
              updateMutation.isPending || deleteMutation.isPending
            }
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {events.length} of {pagination.total} events
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
      <EventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
      />

      <EventDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={selectedEvent}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      <EventDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        event={selectedEvent}
      />
    </div>
  );
}
