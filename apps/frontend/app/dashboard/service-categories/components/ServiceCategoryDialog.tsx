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
import type { ServiceCategory } from "@/types/service-category.type";
import { ServiceCategoryForm, type ServiceCategoryFormValues } from "./ServiceCategoryForm";

interface ServiceCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ServiceCategory;
  onSubmit: (data: ServiceCategoryFormValues) => void;
  isLoading?: boolean;
}

export function ServiceCategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading,
}: ServiceCategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Service Category" : "Create Service Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the category fields below." : "Add a category to organize your services."}
          </DialogDescription>
        </DialogHeader>
        <ServiceCategoryForm initialData={category} onSubmit={onSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}

interface ServiceCategoryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ServiceCategory | null;
}

export function ServiceCategoryDetailDialog({ open, onOpenChange, category }: ServiceCategoryDetailDialogProps) {
  if (!category) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Service Category Details</DialogTitle>
          <DialogDescription>View detailed information about this category.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">Name</h4>
            <p className="text-base">{category.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">Slug</h4>
            <p className="text-base text-muted-foreground">{category.slug}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Status</h4>
              <p className="text-base">{category.status}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Sort order</h4>
              <p className="text-base">{category.sortOrder}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Created At</h4>
              <p className="text-sm">{new Date(category.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Updated At</h4>
              <p className="text-sm">{new Date(category.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteServiceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ServiceCategory | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteServiceCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isLoading,
}: DeleteServiceCategoryDialogProps) {
  if (!category) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete service category?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">\"{category.name}\"</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

