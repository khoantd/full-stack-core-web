"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/types/appointment.type";

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
}: AppointmentDetailDialogProps) {
  const t = useTranslations("pages.appointments");
  const tStatus = useTranslations("pages.appointments.status");

  if (!appointment) return null;

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM dd, yyyy HH:mm");
    } catch {
      return date;
    }
  };

  const statusVariant = (s: string) => {
    if (s === "confirmed" || s === "completed") return "default" as const;
    if (s === "cancelled") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{appointment.title}</DialogTitle>
          <DialogDescription>{t("detailTitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(appointment.status)}>{tStatus(appointment.status)}</Badge>
            <span className="text-muted-foreground">
              {t("source")}: {appointment.source}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground mb-1">{t("form.startLabel")}</p>
              <p className="font-medium">{formatDate(appointment.startAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{t("form.endLabel")}</p>
              <p className="font-medium">{formatDate(appointment.endAt)}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">{t("customer")}</p>
            <p className="font-medium">{appointment.customer.name}</p>
            <p>{appointment.customer.email}</p>
            {appointment.customer.phone && <p>{appointment.customer.phone}</p>}
          </div>

          {appointment.notes && (
            <div>
              <p className="text-muted-foreground mb-1">{t("form.notesLabel")}</p>
              <p className="whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 border-t pt-4 text-muted-foreground text-xs">
            <div>
              <p className="mb-0.5">{t("detailCreated")}</p>
              <p>{formatDate(appointment.createdAt)}</p>
            </div>
            <div>
              <p className="mb-0.5">{t("detailUpdated")}</p>
              <p>{formatDate(appointment.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
