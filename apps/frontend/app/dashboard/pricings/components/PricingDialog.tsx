"use client";

import * as React from "react";
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
import type { CreatePricingRequest, Pricing, UpdatePricingRequest } from "@/types/pricing.type";
import { PricingForm } from "./PricingForm";

interface PricingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: Pricing | null;
  onSubmit: (payload: CreatePricingRequest | UpdatePricingRequest) => void;
  isLoading?: boolean;
  /** Distinct keys when two dialogs mount (create + edit) so React does not reuse stale form state. */
  variant: "create" | "edit";
}

export function PricingFormDialog({
  open,
  onOpenChange,
  pricing,
  onSubmit,
  isLoading,
  variant,
}: PricingFormDialogProps) {
  const isEditMode = !!pricing;
  const formKey = open
    ? isEditMode && pricing
      ? `${variant}-${pricing._id}`
      : `${variant}-new`
    : `${variant}-closed`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Pricing" : "Create Pricing"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the pricing catalog entry below." : "Create a new pricing catalog entry with tiers."}
          </DialogDescription>
        </DialogHeader>
        <PricingForm
          key={formKey}
          initialData={pricing}
          onSubmit={onSubmit}
          isLoading={isLoading}
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

function formatAmount(currency: "VND" | "USD", unitAmount: number) {
  const amount = currency === "USD" ? unitAmount / 100 : unitAmount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function PricingDetailDialog({ open, onOpenChange, pricing }: PricingDetailDialogProps) {
  if (!pricing) return null;
  const tiers = [...(pricing.tiers ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pricing Details</DialogTitle>
          <DialogDescription>View tiers and metadata for this pricing entry.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{pricing.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-foreground">
                {pricing.status}
              </span>
              {pricing.slug ? (
                <span className="text-xs text-muted-foreground">Slug: {pricing.slug}</span>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Tiers</p>
            {tiers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tiers</p>
            ) : (
              <div className="space-y-3">
                {tiers.map((t, idx) => (
                  <div key={`${t.name}-${idx}`} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        {t.description ? (
                          <p className="text-sm text-muted-foreground">{t.description}</p>
                        ) : null}
                      </div>
                      <div className="text-sm font-semibold">
                        {formatAmount(t.currency, t.unitAmount)}
                      </div>
                    </div>
                    {t.features?.length ? (
                      <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {t.features.map((f) => (
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
              <p className="text-xs text-muted-foreground">Created At</p>
              <p>{new Date(pricing.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Updated At</p>
              <p>{new Date(pricing.updatedAt).toLocaleString()}</p>
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
  if (!pricing) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Pricing?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">&quot;{pricing.title}&quot;</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={isLoading}
            className={buttonVariants({ variant: "destructive" })}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

