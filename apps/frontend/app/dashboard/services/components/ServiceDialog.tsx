"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, ImageIcon, Calendar, DollarSign, Clock, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDeleteService } from "@/hooks/useService";
import ServiceForm from "./ServiceForm";
import type { Service } from "@/types/service.type";

// Create / Edit dialog
interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSuccess?: () => void;
}

export function ServiceFormDialog({ open, onOpenChange, service, onSuccess }: ServiceFormDialogProps) {
  const isEditMode = !!service;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Service" : "Create New Service"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the service information below." : "Fill in the details to create a new service."}
          </DialogDescription>
        </DialogHeader>
        <ServiceForm
          service={service}
          onSuccess={() => { onOpenChange(false); onSuccess?.(); }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// Detail / View dialog
interface ServiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}

export function ServiceDetailDialog({ open, onOpenChange, service }: ServiceDetailDialogProps) {
  if (!service) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusColors: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Published: "bg-green-100 text-green-700",
    Archived: "bg-yellow-100 text-yellow-700",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service Details</DialogTitle>
          <DialogDescription>View complete service information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {service.image ? (
            <img src={service.image} alt={service.title} className="w-full h-48 rounded-lg object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">No image</p>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[service.status] || "bg-gray-100 text-gray-700"}`}>
                {service.status}
              </span>
              {service.category && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />{service.category}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {service.price != null && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${service.price.toLocaleString()}</span>
              </div>
            )}
            {service.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{service.duration}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{service.description}</p>
          </div>

          {(service.seoTitle || service.seoDescription) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">SEO</p>
                {service.seoTitle && (
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="text-sm">{service.seoTitle}</p>
                  </div>
                )}
                {service.seoDescription && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{service.seoDescription}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" /> Created At
              </div>
              <p>{formatDate(service.createdAt)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" /> Updated At
              </div>
              <p>{formatDate(service.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delete confirmation dialog
interface DeleteServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSuccess?: () => void;
}

export function DeleteServiceDialog({ open, onOpenChange, service, onSuccess }: DeleteServiceDialogProps) {
  const deleteService = useDeleteService();

  const handleDelete = async () => {
    if (!service) return;
    try {
      await deleteService.mutateAsync(service._id);
      toast.success("Service deleted successfully", { description: `"${service.title}" has been deleted.` });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to delete service", { description: error instanceof Error ? error.message : "An error occurred" });
    }
  };

  if (!service) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Service?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{service.title}"</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteService.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            disabled={deleteService.isPending}
            className={buttonVariants({ variant: "destructive" })}
          >
            {deleteService.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {deleteService.isPending ? "Deleting..." : "Delete Service"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
