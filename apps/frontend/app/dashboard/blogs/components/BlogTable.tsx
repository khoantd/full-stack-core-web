"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import type { Blog } from "@/types/blog.type";

// Action handlers type
export interface BlogTableActions {
  onView?: (blog: Blog) => void;
  onEdit?: (blog: Blog) => void;
  onDelete?: (blog: Blog) => void;
  onVersions?: (blog: Blog) => void;
}

// Factory function to create columns with action handlers
export const createColumns = (actions?: BlogTableActions, options?: { locale?: string }): ColumnDef<Blog>[] => [
  {
    accessorKey: "_id",
    header: "#",
    cell: ({ row }) => {
      const id = row.getValue("_id") as string;
      return id?.slice(-6) || "-";
    },
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string | undefined;
      return (
        <div className="flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={row.original.title}
              className="h-12 w-16 rounded-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`h-12 w-16 rounded-md bg-muted flex items-center justify-center ${
              image ? "hidden" : ""
            }`}
          >
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="max-w-[200px] truncate font-medium" title={title}>
          {title || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate text-muted-foreground" title={description}>
          {description || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colors: Record<string, string> = {
        Draft: "bg-gray-100 text-gray-700",
        Published: "bg-green-100 text-green-700",
        Archived: "bg-yellow-100 text-yellow-700",
      };
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
          {status || "Draft"}
        </span>
      );
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue("author") || "—"}</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        className="-ml-3"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString(options?.locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as string;
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString(options?.locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const blog = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions?.onView?.(blog)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions?.onEdit?.(blog)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {actions?.onVersions && (
              <DropdownMenuItem onClick={() => actions?.onVersions?.(blog)}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Version History
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actions?.onDelete?.(blog)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface BlogTableProps {
  data: Blog[];
  actions?: BlogTableActions;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function BlogTable({
  data,
  actions,
  searchValue = "",
  onSearchChange,
}: BlogTableProps) {
  const locale = useLocale();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Create columns with action handlers
  const tableColumns = React.useMemo(() => createColumns(actions, { locale }), [actions, locale]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search blogs..."
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table className="border-t">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                No blogs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
