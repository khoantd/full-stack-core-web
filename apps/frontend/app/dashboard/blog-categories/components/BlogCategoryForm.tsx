"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateBlogCategory,
  useBlogCategory,
  useUpdateBlogCategory,
} from "@/hooks/useBlogCategory";
import type { BlogCategory, BlogCategoryStatus } from "@/types/blog-category.type";

const enSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: z.string().min(1, "Slug is required").max(160),
  status: z.enum(["Draft", "Published", "Archived"]).default("Published"),
  sortOrder: z.coerce.number().min(0).default(0),
});

const viSchema = z.object({
  name: z.string().min(1, "Vietnamese name is required").max(120),
});

type EnFormValues = z.infer<typeof enSchema>;
type ViFormValues = z.infer<typeof viSchema>;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

const emptyEn: EnFormValues = { name: "", slug: "", status: "Published", sortOrder: 0 };

function toEnValues(cat: BlogCategory | null | undefined): EnFormValues {
  if (!cat) return emptyEn;
  return {
    name: cat.name ?? "",
    slug: cat.slug ?? "",
    status: (cat.status as BlogCategoryStatus) ?? "Published",
    sortOrder: cat.sortOrder ?? 0,
  };
}

interface BlogCategoryFormProps {
  category?: BlogCategory | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BlogCategoryForm({ category, onSuccess, onCancel }: BlogCategoryFormProps) {
  const isEditMode = !!category;
  const [activeLang, setActiveLang] = React.useState<"en" | "vi">("en");

  const { data: catEn } = useBlogCategory(isEditMode ? category?._id ?? null : null, { locale: "en" });
  const { data: catVi } = useBlogCategory(isEditMode ? category?._id ?? null : null, { locale: "vi" });

  const createEn = useCreateBlogCategory({ locale: "en" });
  const updateEn = useUpdateBlogCategory({ locale: "en" });
  const updateVi = useUpdateBlogCategory({ locale: "vi" });

  const isLoading = createEn.isPending || updateEn.isPending || updateVi.isPending;

  const defaultValuesEn = React.useMemo((): EnFormValues => {
    if (!category) return emptyEn;
    return toEnValues(category);
  }, [category]);

  const formEn = useForm<EnFormValues>({
    resolver: zodResolver(enSchema),
    defaultValues: defaultValuesEn,
  });

  const formVi = useForm<ViFormValues>({
    resolver: zodResolver(viSchema),
    defaultValues: { name: "" },
  });

  React.useEffect(() => {
    if (!isEditMode) return;
    if (catEn) formEn.reset(toEnValues(catEn));
  }, [isEditMode, catEn, formEn]);

  React.useEffect(() => {
    if (!isEditMode) return;
    if (catVi) formVi.reset({ name: catVi.name ?? "" });
  }, [isEditMode, catVi, formVi]);

  const nameEn = formEn.watch("name");
  const slugEn = formEn.watch("slug");
  const canAutoSlug = !isEditMode && (!slugEn || slugEn.trim() === "");

  React.useEffect(() => {
    if (!canAutoSlug || !nameEn) return;
    const next = slugify(nameEn);
    if (formEn.getValues("slug") !== next) {
      formEn.setValue("slug", next, { shouldDirty: true, shouldValidate: true });
    }
  }, [canAutoSlug, nameEn, formEn]);

  const handleSave = async () => {
    try {
      const isEnValid = await formEn.trigger();
      if (!isEnValid) { setActiveLang("en"); return; }
      const isViValid = await formVi.trigger();
      if (!isViValid) { setActiveLang("vi"); return; }

      const enVals = formEn.getValues();
      const viName = formVi.getValues().name;
      const payloadEn = {
        name: enVals.name,
        slug: enVals.slug,
        status: enVals.status,
        sortOrder: Number(enVals.sortOrder),
      };

      if (isEditMode && category) {
        await updateEn.mutateAsync({ id: category._id, data: payloadEn });
        await updateVi.mutateAsync({ id: category._id, data: { name: viName } });
        toast.success("Blog category updated successfully");
      } else {
        const created = await createEn.mutateAsync(payloadEn);
        if (created?._id) {
          await updateVi.mutateAsync({ id: created._id, data: { name: viName } });
        }
        toast.success("Blog category created successfully");
      }
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || (isEditMode ? "Failed to update blog category" : "Failed to create blog category"));
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as "en" | "vi")}>
        <TabsList>
          <TabsTrigger value="en">EN</TabsTrigger>
          <TabsTrigger value="vi">VI</TabsTrigger>
        </TabsList>

        <TabsContent value="en" className="space-y-4">
          <Form {...formEn}>
            <div className="space-y-4">
              <FormField
                control={formEn.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Technology" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEn.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. technology" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEn.control}
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
                  control={formEn.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </TabsContent>

        <TabsContent value="vi">
          <Form {...formVi}>
            <FormField
              control={formVi.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Vietnamese) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Công nghệ" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </div>
  );
}
