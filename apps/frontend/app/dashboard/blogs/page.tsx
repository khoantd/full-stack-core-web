"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBlogs } from "@/hooks/useBlog";
import {
  BlogTable,
  BlogFormDialog,
  BlogDetailDialog,
  DeleteBlogDialog,
} from "./components";
import type { Blog } from "@/types/blog.type";

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function BlogsPageContent() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");

  // Debounce search with 300ms delay
  const debouncedSearch = useDebounce(searchInput, 300);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Fetch blogs with debounced search
  const { data, isLoading, isError, error, refetch } = useBlogs({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Action handlers
  const handleView = useCallback((blog: Blog) => {
    setSelectedBlog(blog);
    setIsDetailDialogOpen(true);
  }, []);

  const handleEdit = useCallback((blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedBlog(null);
    setIsCreateDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Table actions
  const tableActions = {
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (data?.pagination?.hasPrevPage) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.pagination?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
        </div>
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading blogs...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
        </div>
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
            <p className="text-destructive">
              {error instanceof Error ? error.message : "An error occurred while loading data"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract blogs from response
  const blogs = data?.data ?? [];
  const pagination = data?.pagination;

  // Empty state
  const isEmpty = blogs.length === 0 && !debouncedSearch;
  const isEmptySearch = blogs.length === 0 && !!debouncedSearch;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
        <Button variant="secondary" onClick={handleCreateNew}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Add New Blog
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isEmpty ? (
            // Empty state when no blogs exist
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <svg
                  className="h-10 w-10 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">No blogs yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first blog post to get started.
                </p>
              </div>
              <Button onClick={handleCreateNew}>
                <PlusCircledIcon className="mr-2 h-4 w-4" /> Create Blog
              </Button>
            </div>
          ) : (
            <>
              <BlogTable
                data={blogs}
                actions={tableActions}
                searchValue={searchInput}
                onSearchChange={handleSearchChange}
              />

              {/* Empty search results */}
              {isEmptySearch && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No blogs found matching "{debouncedSearch}"
                  </p>
                </div>
              )}

              {/* Server-side Pagination */}
              {pagination && blogs.length > 0 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} blogs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Blog Dialog */}
      <BlogFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        blog={null}
        onSuccess={handleSuccess}
      />

      {/* Edit Blog Dialog */}
      <BlogFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        blog={selectedBlog}
        onSuccess={handleSuccess}
      />

      {/* Blog Detail Dialog */}
      <BlogDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        blog={selectedBlog}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteBlogDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        blog={selectedBlog}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default function BlogsPage() {
  return <BlogsPageContent />;
}
