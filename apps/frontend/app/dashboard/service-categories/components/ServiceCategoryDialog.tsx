"use client";

import { useTranslations } from "next-intl";
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
import { ServiceCategoryForm } from "./ServiceCategoryForm";

interface ServiceCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ServiceCategory;
  onSuccess?: () => void;
}

export function ServiceCategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: ServiceCategoryFormDialogProps) {
  const t = useTranslations("pages.serviceCategories.dialog");
  const formKey = open ? (category ? `edit-${category._id}` : "create-new") : "closed";

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{category ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>
            {category ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <ServiceCategoryForm
          key={formKey}
          category={category}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
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
  const t = useTranslations("pages.serviceCategories.dialog");
  if (!category) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t("detailTitle")}</DialogTitle>
          <DialogDescription>{t("detailDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("name")}</h4>
            <p className="text-base">{category.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("slug")}</h4>
            <p className="text-base text-muted-foreground">{category.slug}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("status")}</h4>
              <p className="text-base">{category.status}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("sortOrder")}</h4>
              <p className="text-base">{category.sortOrder}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("createdAt")}</h4>
              <p className="text-sm">{new Date(category.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("updatedAt")}</h4>
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
  const t = useTranslations("pages.serviceCategories.dialog");
  if (!category) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription", { name: category.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t("deleting") : t("deleteAction")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
