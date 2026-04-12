"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateServiceCategory,
  useServiceCategory,
  useUpdateServiceCategory,
} from "@/hooks/useServiceCategory";
import type { ServiceCategory, ServiceCategoryStatus } from "@/types/service-category.type";

function createEnSchema(msgs: { nameRequired: string; slugRequired: string }) {
  return z.object({
    name: z.string().min(1, msgs.nameRequired).max(120),
    slug: z.string().min(1, msgs.slugRequired).max(160),
    status: z.enum(["Draft", "Published", "Archived"]).default("Published"),
    sortOrder: z.coerce.number().min(0).default(0),
  });
}

function createViSchema(msgs: { nameRequired: string }) {
  return z.object({
    name: z.string().min(1, msgs.nameRequired).max(120),
  });
}

export type ServiceCategoryEnFormValues = z.infer<ReturnType<typeof createEnSchema>>;
export type ServiceCategoryViFormValues = z.infer<ReturnType<typeof createViSchema>>;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

const emptyEn: ServiceCategoryEnFormValues = {
  name: "",
  slug: "",
  status: "Published",
  sortOrder: 0,
};

function toEnValues(cat: ServiceCategory | null | undefined): ServiceCategoryEnFormValues {
  if (!cat) return emptyEn;
  return {
    name: cat.name ?? "",
    slug: cat.slug ?? "",
    status: (cat.status as ServiceCategoryStatus) ?? "Published",
    sortOrder: cat.sortOrder ?? 0,
  };
}

interface ServiceCategoryFormProps {
  category?: ServiceCategory | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServiceCategoryForm({ category, onSuccess, onCancel }: ServiceCategoryFormProps) {
  const isEditMode = !!category;
  const [activeLang, setActiveLang] = React.useState<"en" | "vi">("en");
  const t = useTranslations("pages.serviceCategories.form");
  const tPage = useTranslations("pages.serviceCategories");

  const { data: catEn } = useServiceCategory(isEditMode ? category?._id ?? null : null, { locale: "en" });
  const { data: catVi } = useServiceCategory(isEditMode ? category?._id ?? null : null, { locale: "vi" });

  const createEn = useCreateServiceCategory({ locale: "en" });
  const updateEn = useUpdateServiceCategory({ locale: "en" });
  const updateVi = useUpdateServiceCategory({ locale: "vi" });

  const isLoading = createEn.isPending || updateEn.isPending || updateVi.isPending;

  const enSchema = React.useMemo(
    () => createEnSchema({ nameRequired: t("nameRequired"), slugRequired: t("slugRequired") }),
    [t],
  );
  const viSchema = React.useMemo(() => createViSchema({ nameRequired: t("nameViRequired") }), [t]);

  const defaultValuesEn = React.useMemo((): ServiceCategoryEnFormValues => {
    if (!category) return emptyEn;
    return toEnValues(category);
  }, [category]);

  const formEn = useForm<ServiceCategoryEnFormValues>({
    resolver: zodResolver(enSchema),
    defaultValues: defaultValuesEn,
  });

  const formVi = useForm<ServiceCategoryViFormValues>({
    resolver: zodResolver(viSchema),
    defaultValues: { name: "" },
  });

  React.useEffect(() => {
    if (!isEditMode) return;
    if (catEn) {
      formEn.reset(toEnValues(catEn));
    }
  }, [isEditMode, catEn, formEn]);

  React.useEffect(() => {
    if (!isEditMode) return;
    if (catVi) {
      formVi.reset({ name: catVi.name ?? "" });
    }
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
      if (!isEnValid) {
        setActiveLang("en");
        return;
      }
      const isViValid = await formVi.trigger();
      if (!isViValid) {
        setActiveLang("vi");
        return;
      }

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
        toast.success(tPage("updated"));
      } else {
        const created = await createEn.mutateAsync(payloadEn);
        if (created?._id) {
          await updateVi.mutateAsync({ id: created._id, data: { name: viName } });
        }
        toast.success(tPage("created"));
      }
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || (isEditMode ? tPage("updateFailed") : tPage("createFailed")));
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
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("placeholderName")} disabled={isLoading} {...field} />
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
                    <FormLabel>{t("slug")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("placeholderSlug")} disabled={isLoading} {...field} />
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
                      <FormLabel>{t("status")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectStatus")} />
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
                      <FormLabel>{t("sortOrder")}</FormLabel>
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
                  <FormLabel>{t("nameVi")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholderNameVi")} disabled={isLoading} {...field} />
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
          {t("cancel")}
        </Button>
        <Button type="button" onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? t("update") : t("create")}
        </Button>
      </div>
    </div>
  );
}
