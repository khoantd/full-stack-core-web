"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { IconBuilding, IconLoader2, IconPlus, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant } from "@/hooks/useTenant";
import type { Tenant } from "@/types/tenant.type";

const tenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  domain: z.string().optional().or(z.literal("")),
  plan: z.string().optional().or(z.literal("")),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

function TenantForm({
  defaultValues,
  onSubmit,
  isLoading,
}: {
  defaultValues?: Partial<TenantFormValues>;
  onSubmit: (values: TenantFormValues) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: defaultValues ?? {},
  });

  // Auto-generate slug from name
  const name = watch("name");
  useEffect(() => {
    if (!defaultValues?.slug && name) {
      setValue(
        "slug",
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      );
    }
  }, [name, defaultValues?.slug, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input id="name" placeholder="Acme Corp" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="acme-corp" {...register("slug")} />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        <p className="text-xs text-muted-foreground">Unique identifier used in URLs</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo URL</Label>
        <Input id="logo" placeholder="https://example.com/logo.png" {...register("logo")} />
        {errors.logo && <p className="text-sm text-destructive">{errors.logo.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Custom Domain</Label>
        <Input id="domain" placeholder="app.acme.com" {...register("domain")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">Plan</Label>
        <Input id="plan" placeholder="starter / pro / enterprise" {...register("plan")} />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Organization
      </Button>
    </form>
  );
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  const [editOpen, setEditOpen] = useState(false);
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();

  const handleUpdate = (values: TenantFormValues) => {
    updateTenant.mutate(
      { id: tenant._id, data: values },
      {
        onSuccess: () => {
          toast.success("Organization updated");
          setEditOpen(false);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Update failed"),
      }
    );
  };

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {tenant.logo ? (
              <img
                src={tenant.logo}
                alt={tenant.name}
                className="h-10 w-10 rounded-lg object-cover border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconBuilding className="h-5 w-5" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{tenant.name}</CardTitle>
              <CardDescription className="text-xs font-mono">{tenant.slug}</CardDescription>
            </div>
          </div>
          <Badge
            variant={tenant.status === "active" ? "default" : "secondary"}
            className="shrink-0 text-xs"
          >
            {tenant.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {(tenant.domain || tenant.plan) && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {tenant.domain && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Domain:</span> {tenant.domain}
              </span>
            )}
            {tenant.plan && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Plan:</span> {tenant.plan}
              </span>
            )}
          </div>
        )}

        <Separator />

        <div className="flex items-center gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 cursor-pointer">
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Organization</DialogTitle>
              </DialogHeader>
              <TenantForm
                defaultValues={{
                  name: tenant.name,
                  slug: tenant.slug,
                  logo: tenant.logo ?? "",
                  domain: tenant.domain ?? "",
                  plan: tenant.plan ?? "",
                }}
                onSubmit={handleUpdate}
                isLoading={updateTenant.isPending}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer text-destructive hover:text-destructive">
                <IconTrash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{tenant.name}</strong> and all associated
                  data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    deleteTenant.mutate(tenant._id, {
                      onSuccess: () => toast.success("Organization deleted"),
                      onError: (err: any) =>
                        toast.error(err?.response?.data?.message ?? "Delete failed"),
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrganizationPage() {
  const { data: tenants, isLoading } = useTenants();
  const createTenant = useCreateTenant();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = (values: TenantFormValues) => {
    createTenant.mutate(values, {
      onSuccess: () => {
        toast.success("Organization created");
        setCreateOpen(false);
      },
      onError: (err: any) =>
        toast.error(err?.response?.data?.message ?? "Failed to create organization"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Organizations</h3>
          <p className="text-sm text-muted-foreground">
            Manage tenants and their settings. Each organization has isolated data.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="cursor-pointer">
              <IconPlus className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Organization</DialogTitle>
            </DialogHeader>
            <TenantForm onSubmit={handleCreate} isLoading={createTenant.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !tenants?.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <IconBuilding className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No organizations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first organization to get started with multi-tenancy.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tenants.map((tenant) => (
            <TenantCard key={tenant._id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
