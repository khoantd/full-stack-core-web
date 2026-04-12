"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconDotsVertical, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import type { Appointment } from "@/types/appointment.type";

interface AppointmentTableProps {
  appointments: Appointment[];
  onEdit: (row: Appointment) => void;
  onDelete: (row: Appointment) => void;
  onView: (row: Appointment) => void;
}

export function AppointmentTable({
  appointments,
  onEdit,
  onDelete,
  onView,
}: AppointmentTableProps) {
  const t = useTranslations("pages.appointments");
  const tStatus = useTranslations("pages.appointments.status");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Appointment | null>(null);

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

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noYetTitle")}</p>
        <p className="text-muted-foreground mt-1 text-sm">{t("noYetSubtitle")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("form.titleLabel")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("form.startLabel")}</TableHead>
              <TableHead>{t("form.endLabel")}</TableHead>
              <TableHead>{t("form.statusLabel")}</TableHead>
              <TableHead>{t("source")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((row) => (
              <TableRow key={row._id}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{row.customer.name}</span>
                    <span className="text-muted-foreground text-xs">{row.customer.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">{formatDate(row.startAt)}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">{formatDate(row.endAt)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.status)}>{tStatus(row.status)}</Badge>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground text-sm">{row.source}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="cursor-pointer">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onView(row)}>
                        <IconEye className="mr-2 h-4 w-4" />
                        {t("view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(row)}>
                        <IconEdit className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => {
                          setToDelete(row);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <IconTrash className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription")}
              {toDelete ? ` (${toDelete.title})` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) onDelete(toDelete);
                setDeleteDialogOpen(false);
                setToDelete(null);
              }}
            >
              {t("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
