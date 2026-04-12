"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import type { FaqSection } from "@/types/faq-section.type";
import { FaqSectionForm } from "./FaqSectionForm";

interface FaqSectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: FaqSection | null;
  onSuccess?: () => void;
  variant: "create" | "edit";
}

export function FaqSectionFormDialog({
  open,
  onOpenChange,
  section,
  onSuccess,
  variant,
}: FaqSectionFormDialogProps) {
  const t = useTranslations("pages.faqSections.dialog");
  const isEditMode = !!section;
  const formKey = open
    ? isEditMode && section
      ? `${variant}-${section._id}`
      : `${variant}-new`
    : `${variant}-closed`;

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <FaqSectionForm
          key={formKey}
          section={section}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface FaqSectionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: FaqSection | null;
}

export function FaqSectionDetailDialog({ open, onOpenChange, section }: FaqSectionDetailDialogProps) {
  const t = useTranslations("pages.faqSections.dialog");
  const ts = useTranslations("pages.faqSections");
  const locale = useLocale();
  if (!section) return null;
  const items = [...(section.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("detailTitle")}</DialogTitle>
          <DialogDescription>{t("detailDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{section.eyebrow}</p>
            <h3 className="text-lg font-semibold mt-1">{section.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-foreground">
                {section.status === "Draft"
                  ? ts("statusDraft")
                  : section.status === "Published"
                    ? ts("statusPublished")
                    : section.status === "Archived"
                      ? ts("statusArchived")
                      : section.status}
              </span>
              {section.slug ? (
                <span className="text-xs text-muted-foreground">{t("slug")} {section.slug}</span>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">{t("itemsLabel")}</p>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noItems")}</p>
            ) : (
              <ol className="list-decimal pl-5 space-y-3">
                {items.map((it, idx) => (
                  <li key={`${it.question}-${idx}`} className="rounded-md border p-3">
                    <p className="font-medium">{it.question}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{it.answer}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t("createdAt")}</p>
              <p>{new Date(section.createdAt).toLocaleString(locale)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("updatedAt")}</p>
              <p>{new Date(section.updatedAt).toLocaleString(locale)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteFaqSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: FaqSection | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteFaqSectionDialog({
  open,
  onOpenChange,
  section,
  onConfirm,
  isLoading,
}: DeleteFaqSectionDialogProps) {
  const t = useTranslations("pages.faqSections.dialog");
  if (!section) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription", { title: section.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={isLoading}
            className={buttonVariants({ variant: "destructive" })}
          >
            {isLoading ? t("deleting") : t("deleteAction")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
