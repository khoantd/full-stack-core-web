"use client";

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
import type { BlogCategory } from "@/types/blog-category.type";
import { BlogCategoryForm } from "./BlogCategoryForm";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Published: "bg-green-100 text-green-700",
  Archived: "bg-yellow-100 text-yellow-700",
};

// Form dialog — create / edit
interface BlogCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: BlogCategory;
  onSuccess?: () => void;
}

export function BlogCategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: BlogCategoryFormDialogProps) {
  const formKey = open ? (category ? `edit-${category._id}` : "create-new") : "closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Blog Category" : "Create Blog Category"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Update the category details below."
              : "Fill in the details to create a new blog category."}
          </DialogDescription>
        </DialogHeader>
        <BlogCategoryForm
          key={formKey}
          category={category}
          onSuccess={() => { onOpenChange(false); onSuccess?.(); }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// Detail dialog — view only
interface BlogCategoryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BlogCategory | null;
}

export function BlogCategoryDetailDialog({
  open,
  onOpenChange,
  category,
}: BlogCategoryDetailDialogProps) {
  if (!category) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
          <DialogDescription>Full details for this blog category.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Name</p>
            <p className="text-base font-medium">{category.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Slug</p>
            <p className="text-sm font-mono text-muted-foreground">{category.slug}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Status</p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[category.status] ?? "bg-gray-100 text-gray-700"}`}>
                {category.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Sort Order</p>
              <p className="text-sm">{category.sortOrder}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Created At</p>
              <p>{new Date(category.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Updated At</p>
              <p>{new Date(category.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delete confirmation dialog
interface DeleteBlogCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BlogCategory | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteBlogCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isLoading,
}: DeleteBlogCategoryDialogProps) {
  if (!category) return null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">&quot;{category.name}&quot;</span>?
            This action cannot be undone. Any blogs assigned to this category will become uncategorised.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting…" : "Delete Category"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
