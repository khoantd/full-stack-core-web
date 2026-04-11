"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useBlogs, useBlogVersions, useRestoreBlogVersion } from "@/hooks/useBlog";
import {
  BlogTable, BlogFormDialog, BlogDetailDialog, DeleteBlogDialog,
} from "./components";
import type { Blog, BlogStatus } from "@/types/blog.type";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function VersionHistoryDialog({
  open,
  onOpenChange,
  blog,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  blog: Blog | null;
}) {
  const t = useTranslations("pages.blogs.versionHistory");
  const { data: versions = [], isLoading } = useBlogVersions(open ? blog?._id ?? null : null);
  const restoreMutation = useRestoreBlogVersion();

  const handleRestore = async (versionId: string) => {
    if (!blog) return;
    try {
      await restoreMutation.mutateAsync({ blogId: blog._id, versionId });
      toast.success(t("restored"));
      onOpenChange(false);
    } catch {
      toast.error(t("restoreFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { title: blog?.title ?? "" })}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-center py-4 text-muted-foreground">{t("loading")}</p>
        ) : versions.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="space-y-3">
            {versions.map((v, i) => (
              <div key={v._id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">v{v.versionNumber}</span>
                    {i === 0 && <Badge variant="secondary" className="text-xs">{t("current")}</Badge>}
                    {v.status && <Badge variant="outline" className="text-xs">{v.status}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(v.createdAt), "MMM dd, yyyy HH:mm")}</p>
                </div>
                {i !== 0 && (
                  <Button size="sm" variant="outline" onClick={() => handleRestore(v._id)} disabled={restoreMutation.isPending}>
                    {t("restore")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BlogsPageContent() {
  const t = useTranslations("pages.blogs");
  const tp = useTranslations("pages.blogs.pagination");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchInput, 300);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const { data, isLoading, isError, error, refetch } = useBlogs({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? (statusFilter as BlogStatus) : undefined,
  });

  const handleView = useCallback((blog: Blog) => { setSelectedBlog(blog); setIsDetailDialogOpen(true); }, []);
  const handleEdit = useCallback((blog: Blog) => { setSelectedBlog(blog); setIsEditDialogOpen(true); }, []);
  const handleDelete = useCallback((blog: Blog) => { setSelectedBlog(blog); setIsDeleteDialogOpen(true); }, []);
  const handleVersions = useCallback((blog: Blog) => { setSelectedBlog(blog); setIsVersionDialogOpen(true); }, []);
  const handleCreateNew = useCallback(() => { setSelectedBlog(null); setIsCreateDialogOpen(true); }, []);
  const handleSuccess = useCallback(() => { refetch(); }, [refetch]);

  const tableActions = { onView: handleView, onEdit: handleEdit, onDelete: handleDelete, onVersions: handleVersions };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
            <p className="text-destructive">{error instanceof Error ? error.message : "An error occurred"}</p>
            <Button onClick={() => refetch()} variant="outline">{t("tryAgain")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const blogs = data?.data ?? [];
  const pagination = data?.pagination;
  const isEmpty = blogs.length === 0 && !debouncedSearch && statusFilter === "all";
  const isEmptySearch = blogs.length === 0 && (!!debouncedSearch || statusFilter !== "all");

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Button variant="secondary" onClick={handleCreateNew}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> {t("addNew")}
        </Button>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t("noYetTitle")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("noYetSubtitle")}</p>
              </div>
              <Button onClick={handleCreateNew}><PlusCircledIcon className="mr-2 h-4 w-4" /> {t("create")}</Button>
            </div>
          ) : (
            <>
              <BlogTable
                data={blogs}
                actions={tableActions}
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
              {pagination && blogs.length > 0 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    {tp("showing", {
                      from: (pagination.page - 1) * pagination.limit + 1,
                      to: Math.min(pagination.page * pagination.limit, pagination.total),
                      total: pagination.total,
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}>
                      <ChevronLeft className="h-4 w-4 mr-1" />{tp("previous")}
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {tp("pageOf", { page: pagination.page, totalPages: pagination.totalPages })}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}>
                      {tp("next")}<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <BlogFormDialog
        variant="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        blog={null}
        onSuccess={handleSuccess}
      />
      <BlogFormDialog
        variant="edit"
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        blog={selectedBlog}
        onSuccess={handleSuccess}
      />
      <BlogDetailDialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen} blog={selectedBlog} />
      <DeleteBlogDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} blog={selectedBlog} onSuccess={handleSuccess} />
      <VersionHistoryDialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen} blog={selectedBlog} />
    </>
  );
}

export default function BlogsPage() {
  return <BlogsPageContent />;
}
