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
import type { Pricing } from "@/types/pricing.type";
import { PricingForm } from "./PricingForm";

interface PricingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: Pricing | null;
  onSuccess?: () => void;
  /** Distinct keys when two dialogs mount (create + edit) so React does not reuse stale form state. */
  variant: "create" | "edit";
}

export function PricingFormDialog({
  open,
  onOpenChange,
  pricing,
  onSuccess,
  variant,
}: PricingFormDialogProps) {
  const t = useTranslations("pages.pricings.dialog");
  const isEditMode = !!pricing;
  const formKey = open
    ? isEditMode && pricing
      ? `${variant}-${pricing._id}`
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
        <PricingForm
          key={formKey}
          pricing={pricing}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface PricingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: Pricing | null;
}

function formatAmount(currency: "VND" | "USD", unitAmount: number, locale: string) {
  const amount = currency === "USD" ? unitAmount / 100 : unitAmount;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

export function PricingDetailDialog({ open, onOpenChange, pricing }: PricingDetailDialogProps) {
  const t = useTranslations("pages.pricings.dialog");
  const ts = useTranslations("pages.pricings");
  const locale = useLocale();
  if (!pricing) return null;
  const tiers = [...(pricing.tiers ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("detailTitle")}</DialogTitle>
          <DialogDescription>{t("detailDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{pricing.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-foreground">
                {pricing.status === "Draft"
                  ? ts("statusDraft")
                  : pricing.status === "Published"
                    ? ts("statusPublished")
                    : pricing.status === "Archived"
                      ? ts("statusArchived")
                      : pricing.status}
              </span>
              {pricing.slug ? (
                <span className="text-xs text-muted-foreground">{t("slug")} {pricing.slug}</span>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">{t("tiersLabel")}</p>
            {tiers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noTiers")}</p>
            ) : (
              <div className="space-y-3">
                {tiers.map((tier, idx) => (
                  <div key={`${tier.name}-${idx}`} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{tier.name}</p>
                        {tier.description ? (
                          <p className="text-sm text-muted-foreground">{tier.description}</p>
                        ) : null}
                      </div>
                      <div className="text-sm font-semibold">
                        {formatAmount(tier.currency, tier.unitAmount, locale)}
                      </div>
                    </div>
                    {tier.features?.length ? (
                      <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {tier.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t("createdAt")}</p>
              <p>{new Date(pricing.createdAt).toLocaleString(locale)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("updatedAt")}</p>
              <p>{new Date(pricing.updatedAt).toLocaleString(locale)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeletePricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: Pricing | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeletePricingDialog({ open, onOpenChange, pricing, onConfirm, isLoading }: DeletePricingDialogProps) {
  const t = useTranslations("pages.pricings.dialog");
  if (!pricing) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription", { title: pricing.title })}
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
