"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, ImageIcon, Calendar, FileText } from "lucide-react";
import { useLocale } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDeleteBlog } from "@/hooks/useBlog";
import BlogForm from "./BlogForm";
import type { Blog } from "@/types/blog.type";

// Blog Form Dialog - Create/Edit
interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: Blog | null;
  onSuccess?: () => void;
  /** Distinct keys when two dialogs mount (create + edit) so React does not reuse stale form state. */
  variant: "create" | "edit";
}

export function BlogFormDialog({
  open,
  onOpenChange,
  blog,
  onSuccess,
  variant,
}: BlogFormDialogProps) {
  const isEditMode = !!blog;

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const formKey = open
    ? isEditMode && blog
      ? `${variant}-${blog._id}`
      : `${variant}-new`
    : `${variant}-closed`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Blog" : "Create New Blog"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the blog information below."
              : "Fill in the details to create a new blog post."}
          </DialogDescription>
        </DialogHeader>
        <BlogForm
          key={formKey}
          blog={blog}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// Blog Detail Dialog - View Only
interface BlogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
}

export function BlogDetailDialog({ open, onOpenChange, blog }: BlogDetailDialogProps) {
  const locale = useLocale();
  if (!blog) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Blog Details</DialogTitle>
          <DialogDescription>View complete blog information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Preview */}
          {blog.image ? (
            <div className="relative w-full">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
              <div className="hidden w-full h-48 rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Failed to load image</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">No image</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold">{blog.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {blog.status && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  blog.status === "Published" ? "bg-green-100 text-green-700" :
                  blog.status === "Archived" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {blog.status}
                </span>
              )}
              {blog.author && (
                <span className="text-xs text-muted-foreground">by {blog.author}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              Description
            </div>
            <p className="text-sm whitespace-pre-wrap">{blog.description}</p>
          </div>

          {(blog.seoTitle || blog.seoDescription) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">SEO</p>
                {blog.seoTitle && (
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="text-sm">{blog.seoTitle}</p>
                  </div>
                )}
                {blog.seoDescription && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{blog.seoDescription}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Created At
              </div>
              <p>{formatDate(blog.createdAt)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Updated At
              </div>
              <p>{formatDate(blog.updatedAt)}</p>
            </div>
            {blog.publishedAt && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Published At
                </div>
                <p>{formatDate(blog.publishedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delete Blog Dialog - Confirmation
interface DeleteBlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
  onSuccess?: () => void;
}

export function DeleteBlogDialog({ open, onOpenChange, blog, onSuccess }: DeleteBlogDialogProps) {
  const deleteBlog = useDeleteBlog();
  const isLoading = deleteBlog.isPending;

  const handleDelete = async () => {
    if (!blog) {
      toast.error("No blog selected");
      return;
    }

    try {
      await deleteBlog.mutateAsync(blog._id);
      toast.success("Blog deleted successfully", {
        description: `"${blog.title}" has been deleted.`,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to delete blog", {
        description: errorMessage,
      });
    }
  };

  if (!blog) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Blog?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">&quot;{blog.title}&quot;</span>? This action
            cannot be undone and will permanently remove the blog from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-close
              handleDelete();
            }}
            disabled={isLoading}
            className={buttonVariants({ variant: "destructive" })}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Deleting..." : "Delete Blog"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
