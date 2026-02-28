"use client";

import Image from "next/image";
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
import { Product } from "@/types/product.type";
import { CategoryProduct } from "@/types/category-product.type";
import { ProductForm } from "./ProductForm";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories: CategoryProduct[];
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
  }) => void;
  isLoading?: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
  isLoading,
}: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product information below."
              : "Add a new product to your catalog."}
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          initialData={product}
          categories={categories}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailDialog({
  open,
  onOpenChange,
  product,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            View detailed information about this product.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {product.image && (
            <div className="relative w-full h-64 rounded-md overflow-hidden border">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Name
            </h4>
            <p className="text-base font-medium">{product.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Description
            </h4>
            <p className="text-base">{product.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Price
              </h4>
              <p className="text-base font-medium">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(product.price)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Category
              </h4>
              <p className="text-base">{category || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Created At
              </h4>
              <p className="text-sm">
                {new Date(product.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                Updated At
              </h4>
              <p className="text-sm">
                {new Date(product.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  isLoading,
}: DeleteProductDialogProps) {
  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the product{" "}
            <span className="font-semibold">{product.name}</span>. This action
            cannot be undone.
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
