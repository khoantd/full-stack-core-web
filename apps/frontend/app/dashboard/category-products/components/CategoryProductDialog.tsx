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
import { CategoryProduct } from "@/types/category-product.type";
import { CategoryProductForm } from "./CategoryProductForm";

interface CategoryProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryProduct?: CategoryProduct;
  onSubmit: (data: { name: string; description?: string }) => void;
  isLoading?: boolean;
}

export function CategoryProductFormDialog({
  open,
  onOpenChange,
  categoryProduct,
  onSubmit,
  isLoading,
}: CategoryProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {categoryProduct ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {categoryProduct
              ? "Update the category information below."
              : "Add a new category to your product catalog."}
          </DialogDescription>
        </DialogHeader>
        <CategoryProductForm
          initialData={categoryProduct}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

interface CategoryProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryProduct: CategoryProduct | null;
}

export function CategoryProductDetailDialog({
  open,
  onOpenChange,
  categoryProduct,
}: CategoryProductDetailDialogProps) {
  if (!categoryProduct) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
          <DialogDescription>
            View detailed information about this category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Name
            </h4>
            <p className="text-base">{categoryProduct.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Description
            </h4>
            <p className="text-base">
              {categoryProduct.description || (
                <span className="text-muted-foreground">No description</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Created At
              </h4>
              <p className="text-sm">
                {new Date(categoryProduct.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Updated At
              </h4>
              <p className="text-sm">
                {new Date(categoryProduct.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteCategoryProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryProduct: CategoryProduct | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteCategoryProductDialog({
  open,
  onOpenChange,
  categoryProduct,
  onConfirm,
  isLoading,
}: DeleteCategoryProductDialogProps) {
  if (!categoryProduct) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the category{" "}
            <span className="font-semibold">{categoryProduct.name}</span>. This
            action cannot be undone.
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
