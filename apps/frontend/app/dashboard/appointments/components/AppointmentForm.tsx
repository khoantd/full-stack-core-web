"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Appointment, AppointmentStatus } from "@/types/appointment.type";

function toLocalDatetimeValue(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function localDatetimeToIso(local: string): string {
  const d = new Date(local);
  return d.toISOString();
}

const schema = z
  .object({
    title: z.string().min(1, "Required"),
    startAt: z.string().min(1, "Required"),
    endAt: z.string().min(1, "Required"),
    customerName: z.string().min(1, "Required"),
    customerEmail: z.string().email("Invalid email"),
    customerPhone: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  })
  .refine(
    (data) => {
      const s = new Date(data.startAt);
      const e = new Date(data.endAt);
      return e > s;
    },
    { message: "End must be after start", path: ["endAt"] }
  );

type FormData = z.infer<typeof schema>;

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AppointmentForm({ appointment, onSubmit, onCancel, isLoading }: AppointmentFormProps) {
  const t = useTranslations("pages.appointments.form");
  const tStatus = useTranslations("pages.appointments.status");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: appointment?.title ?? "",
      startAt: appointment ? toLocalDatetimeValue(appointment.startAt) : "",
      endAt: appointment ? toLocalDatetimeValue(appointment.endAt) : "",
      customerName: appointment?.customer?.name ?? "",
      customerEmail: appointment?.customer?.email ?? "",
      customerPhone: appointment?.customer?.phone ?? "",
      notes: appointment?.notes ?? "",
      status: appointment?.status ?? undefined,
    },
  });

  const statusVal = watch("status");

  useEffect(() => {
    if (appointment) {
      reset({
        title: appointment.title,
        startAt: toLocalDatetimeValue(appointment.startAt),
        endAt: toLocalDatetimeValue(appointment.endAt),
        customerName: appointment.customer.name,
        customerEmail: appointment.customer.email,
        customerPhone: appointment.customer.phone ?? "",
        notes: appointment.notes ?? "",
        status: appointment.status,
      });
    }
  }, [appointment, reset]);

  const submit = (data: FormData) => {
    const payload: Record<string, unknown> = {
      title: data.title,
      startAt: localDatetimeToIso(data.startAt),
      endAt: localDatetimeToIso(data.endAt),
      customer: {
        name: data.customerName,
        email: data.customerEmail,
        ...(data.customerPhone?.trim() ? { phone: data.customerPhone.trim() } : {}),
      },
      notes: data.notes?.trim() || undefined,
    };
    if (appointment && data.status) {
      payload.status = data.status as AppointmentStatus;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="appt-title">{t("titleLabel")}</Label>
        <Input id="appt-title" {...register("title")} placeholder={t("titlePlaceholder")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="appt-start">{t("startLabel")}</Label>
          <Input id="appt-start" type="datetime-local" {...register("startAt")} />
          {errors.startAt && <p className="text-sm text-destructive">{errors.startAt.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="appt-end">{t("endLabel")}</Label>
          <Input id="appt-end" type="datetime-local" {...register("endAt")} />
          {errors.endAt && <p className="text-sm text-destructive">{errors.endAt.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cust-name">{t("customerName")}</Label>
          <Input id="cust-name" {...register("customerName")} autoComplete="name" />
          {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cust-email">{t("customerEmail")}</Label>
          <Input id="cust-email" type="email" {...register("customerEmail")} autoComplete="email" />
          {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cust-phone">{t("customerPhone")}</Label>
        <Input id="cust-phone" type="tel" {...register("customerPhone")} autoComplete="tel" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="appt-notes">{t("notesLabel")}</Label>
        <Textarea id="appt-notes" {...register("notes")} placeholder={t("notesPlaceholder")} rows={3} />
      </div>

      {appointment && (
        <div className="space-y-2">
          <Label>{t("statusLabel")}</Label>
          <Select
            value={statusVal ?? appointment.status}
            onValueChange={(v) => setValue("status", v as FormData["status"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{tStatus("pending")}</SelectItem>
              <SelectItem value="confirmed">{tStatus("confirmed")}</SelectItem>
              <SelectItem value="cancelled">{tStatus("cancelled")}</SelectItem>
              <SelectItem value="completed">{tStatus("completed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
