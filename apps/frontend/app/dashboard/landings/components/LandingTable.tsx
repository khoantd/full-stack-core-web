"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LandingPage } from "@/types/landing.type";
import { useTranslations } from "next-intl";

export interface LandingTableActions {
  onEdit: (page: LandingPage) => void;
  onDelete: (page: LandingPage) => void;
}

function statusClass(status: string): string {
  const colors: Record<string, string> = {
    Draft: "bg-muted text-foreground",
    Published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-100",
    Archived: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  };
  return colors[status] ?? "bg-muted text-foreground";
}

export function LandingTable({
  data,
  actions,
  searchValue,
  onSearchChange,
}: {
  data: LandingPage[];
  actions: LandingTableActions;
  searchValue: string;
  onSearchChange: (v: string) => void;
}) {
  const t = useTranslations("pages.landings");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<LandingPage>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("pageTitle")}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[220px] truncate font-medium">{row.original.title}</div>
        ),
      },
      {
        accessorKey: "slug",
        header: t("slug"),
        cell: ({ row }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.original.slug}</code>
        ),
      },
      {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge variant="secondary" className={statusClass(s)}>
              {s}
            </Badge>
          );
        },
      },
      {
        id: "default",
        header: t("defaultPage"),
        cell: ({ row }) =>
          row.original.isDefault ? (
            <Badge variant="outline">{t("defaultPage")}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("updatedColumn")}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const d = row.original.updatedAt;
          try {
            return <span className="text-sm text-muted-foreground">{format(new Date(d), "PPp")}</span>;
          } catch {
            return "—";
          }
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const page = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actionsMenu")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => actions.onEdit(page)}>
                  <Pencil className="mr-2 size-4" />
                  {t("edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => actions.onDelete(page)}
                >
                  <Trash2 className="mr-2 size-4" />
                  {t("confirmDelete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [actions, t],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder={t("searchPlaceholder")}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t("noMatch")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
