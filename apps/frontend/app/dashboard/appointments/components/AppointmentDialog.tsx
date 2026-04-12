"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { AppointmentForm } from "./AppointmentForm";
import type { Appointment } from "@/types/appointment.type";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSubmit,
  isLoading,
}: AppointmentDialogProps) {
  const t = useTranslations("pages.appointments.form");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{appointment ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>
            {appointment ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm
          appointment={appointment}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
