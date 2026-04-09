"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ServiceCategory, ServiceCategoryStatus } from "@/types/service-category.type";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: z.string().min(1, "Slug is required").max(160),
  status: z.enum(["Draft", "Published", "Archived"]).default("Published"),
  sortOrder: z.coerce.number().min(0).default(0),
});

export type ServiceCategoryFormValues = z.infer<typeof schema>;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

interface Props {
  initialData?: ServiceCategory;
  onSubmit: (data: ServiceCategoryFormValues) => void;
  isLoading?: boolean;
}

export function ServiceCategoryForm({ initialData, onSubmit, isLoading }: Props) {
  const form = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      status: (initialData?.status as ServiceCategoryStatus | undefined) ?? "Published",
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const name = form.watch("name");
  const slug = form.watch("slug");

  const canAutoSlug = !initialData && (!slug || slug.trim() === "");

  // Auto-fill slug while creating, but don't fight the user once they start editing.
  if (canAutoSlug && name && slug !== slugify(name)) {
    form.setValue("slug", slugify(name), { shouldDirty: true, shouldValidate: true });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sleep Therapy" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g. sleep-therapy" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort order</FormLabel>
                <FormControl>
                  <Input type="number" min="0" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}

