"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAutomakers, useCreateAutomaker, useUpdateAutomaker, useDeleteAutomaker } from "@/hooks/useAutomaker";
import { Automaker } from "@/types/automaker.type";
import Image from "next/image";

const automakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
  logo: z.string().optional(),
  supportedModelYears: z.string().optional(),
});

type FormValues = z.infer<typeof automakerSchema>;

function AutomakerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: Automaker;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(automakerSchema),
    defaultValues: {
      name: initialData?.name || "",
      country: initialData?.country || "",
      logo: initialData?.logo || "",
      supportedModelYears: initialData?.supportedModelYears?.join(", ") || "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    const years = values.supportedModelYears
      ? values.supportedModelYears.split(",").map(y => parseInt(y.trim())).filter(y => !isNaN(y))
      : [];
    onSubmit({ name: values.name, country: values.country, logo: values.logo || undefined, supportedModelYears: years });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="e.g. Toyota" {...field} disabled={isLoading} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="country" render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl><Input placeholder="e.g. Japan" {...field} disabled={isLoading} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="logo" render={({ field }) => (
          <FormItem>
            <FormLabel>Logo URL (optional)</FormLabel>
            <FormControl><Input placeholder="https://..." {...field} disabled={isLoading} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="supportedModelYears" render={({ field }) => (
          <FormItem>
            <FormLabel>Supported Model Years (comma-separated)</FormLabel>
            <FormControl><Input placeholder="e.g. 2020, 2021, 2022" {...field} disabled={isLoading} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : initialData ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function AutomakersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Automaker | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useAutomakers({ page, limit: 10, search: debouncedSearch });
  const createMutation = useCreateAutomaker();
  const updateMutation = useUpdateAutomaker();
  const deleteMutation = useDeleteAutomaker();

  const automakers = data?.data || [];
  const pagination = data?.pagination;

  const handleCreate = useCallback(() => { setSelected(null); setFormOpen(true); }, []);
  const handleEdit = useCallback((a: Automaker) => { setSelected(a); setFormOpen(true); }, []);
  const handleDelete = useCallback((a: Automaker) => { setSelected(a); setDeleteOpen(true); }, []);

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selected) {
        await updateMutation.mutateAsync({ id: selected._id, data: formData });
        toast.success("Automaker updated");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Automaker created");
      }
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save automaker");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected._id);
      toast.success("Automaker deleted");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete automaker");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automakers</h1>
          <p className="text-muted-foreground">Manage car manufacturers</p>
        </div>
        <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" />Add Automaker</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search automakers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : isError ? (
            <p className="text-center text-destructive py-8">Failed to load automakers</p>
          ) : automakers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No automakers found</p>
              <Button className="mt-4" onClick={handleCreate}><Plus className="mr-2 h-4 w-4" />Add Automaker</Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Model Years</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {automakers.map(a => (
                      <TableRow key={a._id}>
                        <TableCell>
                          {a.logo ? (
                            <div className="relative w-10 h-10 rounded overflow-hidden">
                              <Image src={a.logo} alt={a.name} fill className="object-contain" sizes="40px" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>{a.country}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {a.supportedModelYears.slice(0, 4).map(y => (
                              <Badge key={y} variant="outline" className="text-xs">{y}</Badge>
                            ))}
                            {a.supportedModelYears.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{a.supportedModelYears.length - 4}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(a)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(a)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Automaker" : "Add Automaker"}</DialogTitle>
            <DialogDescription>Fill in the manufacturer details.</DialogDescription>
          </DialogHeader>
          <AutomakerForm
            initialData={selected ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automaker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selected?.name}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
