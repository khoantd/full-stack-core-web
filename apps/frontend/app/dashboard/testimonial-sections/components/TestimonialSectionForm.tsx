"use client";

import * as React from "react";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateTestimonialSection,
  useTestimonialSection,
  useUpdateTestimonialSection,
} from "@/hooks/useTestimonialSection";
import type {
  CreateTestimonialSectionRequest,
  TestimonialItem,
  TestimonialSection,
  TestimonialSectionStatus,
  UpdateTestimonialSectionRequest,
} from "@/types/testimonial-section.type";

type ItemForm = {
  text: string;
  name: string;
  role: string;
  rating: number;
  order: number;
};

function clampRating(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return Math.min(5, Math.max(1, Math.round(value)));
  }
  return 5;
}

type TestimonialSchemaMessages = {
  eyebrowRequired: string;
  titleRequired: string;
  textRequired: string;
  nameRequired: string;
  roleRequired: string;
  itemsMinOne: string;
};

function createTestimonialSectionSchema(msgs: TestimonialSchemaMessages) {
  const itemSchema = z.object({
    text: z.string().min(1, msgs.textRequired),
    name: z.string().min(1, msgs.nameRequired),
    role: z.string().min(1, msgs.roleRequired),
    rating: z.number().int().min(1).max(5),
    order: z.number().min(0),
  });

  return z.object({
    eyebrow: z.string().min(1, msgs.eyebrowRequired),
    title: z.string().min(1, msgs.titleRequired),
    slug: z.string().optional(),
    status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
    items: z.array(itemSchema).min(1, msgs.itemsMinOne),
  });
}

type TestimonialSectionFormValues = z.infer<ReturnType<typeof createTestimonialSectionSchema>>;

function itemsToForm(items: TestimonialItem[] | undefined): ItemForm[] {
  const sorted = [...(items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return sorted.map((it, idx) => ({
    text: it.text ?? "",
    name: it.name ?? "",
    role: it.role ?? "",
    rating: clampRating(it.rating),
    order: typeof it.order === "number" ? it.order : idx,
  }));
}

function formToPayload(
  values: TestimonialSectionFormValues,
): CreateTestimonialSectionRequest | UpdateTestimonialSectionRequest {
  return {
    eyebrow: values.eyebrow.trim(),
    title: values.title.trim(),
    slug: values.slug?.trim() || undefined,
    status: values.status as TestimonialSectionStatus,
    items: values.items
      .map((it, idx) => ({
        text: it.text.trim(),
        name: it.name.trim(),
        role: it.role.trim(),
        rating: clampRating(it.rating),
        order: typeof it.order === "number" ? it.order : idx,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
}

function mergeViWithEnStructure(
  en: TestimonialSectionFormValues,
  vi: TestimonialSectionFormValues,
): UpdateTestimonialSectionRequest {
  const structural = formToPayload(en) as CreateTestimonialSectionRequest;
  return {
    ...structural,
    eyebrow: vi.eyebrow.trim(),
    title: vi.title.trim(),
    items: structural.items.map((item, i) => {
      const vit = vi.items[i];
      if (!vit) return item;
      return {
        ...item,
        text: vit.text.trim(),
        name: vit.name.trim(),
        role: vit.role.trim(),
      };
    }),
  };
}

function syncEnStructureIntoVi(
  formEn: UseFormReturn<TestimonialSectionFormValues>,
  formVi: UseFormReturn<TestimonialSectionFormValues>,
) {
  const en = formEn.getValues();
  formVi.setValue("slug", en.slug);
  formVi.setValue("status", en.status);
  const enItems = en.items ?? [];
  const viItems = formVi.getValues("items") ?? [];
  const next = enItems.map((ei, i) => ({
    text: viItems[i]?.text ?? "",
    name: viItems[i]?.name ?? "",
    role: viItems[i]?.role ?? "",
    rating: ei.rating,
    order: ei.order,
  }));
  formVi.setValue("items", next);
}

function toFormValues(
  section: TestimonialSection | null | undefined,
  defaultName: string,
): TestimonialSectionFormValues {
  if (!section) {
    return {
      eyebrow: "",
      title: "",
      slug: "",
      status: "Draft",
      items: [{ text: "", name: defaultName, role: "", rating: 5, order: 0 }],
    };
  }
  return {
    eyebrow: section.eyebrow || "",
    title: section.title || "",
    slug: section.slug ?? "",
    status: (section.status as TestimonialSectionStatus) ?? "Draft",
    items: section.items?.length
      ? itemsToForm(section.items)
      : [{ text: "", name: defaultName, role: "", rating: 5, order: 0 }],
  };
}

const emptyFormValues = (defaultName: string): TestimonialSectionFormValues => ({
  eyebrow: "",
  title: "",
  slug: "",
  status: "Draft",
  items: [{ text: "", name: defaultName, role: "", rating: 5, order: 0 }],
});

function StarRatingInput({
  value,
  onChange,
  disabled,
  label,
  ariaSetRating,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  label: string;
  ariaSetRating: (n: number) => string;
}) {
  return (
    <div className="space-y-1.5" role="group" aria-label={label}>
      <div className="flex flex-wrap items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "rounded-sm p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "cursor-not-allowed opacity-50",
            )}
            aria-label={ariaSetRating(n)}
            aria-pressed={n <= value}
          >
            <Star
              className={cn(
                "h-5 w-5",
                n <= value ? "fill-primary text-primary" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function TestimonialSectionFields({
  form,
  isLoading,
}: {
  form: UseFormReturn<TestimonialSectionFormValues>;
  isLoading: boolean;
}) {
  const t = useTranslations("pages.testimonialSections.form");
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="eyebrow"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("eyebrow")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholderEyebrow")} {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("title")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholderTitle")} {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("slug")}</FormLabel>
              <FormControl>
                <Input placeholder={t("placeholderSlug")} {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
                  <SelectItem value="Draft">{t("statusDraft")}</SelectItem>
                  <SelectItem value="Published">{t("statusPublished")}</SelectItem>
                  <SelectItem value="Archived">{t("statusArchived")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{t("itemsSection")}</p>
          <p className="text-xs text-muted-foreground">{t("itemsHint")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              text: "",
              name: t("newItemName", { number: fields.length + 1 }),
              role: "",
              rating: 5,
              order: fields.length,
            })
          }
          disabled={isLoading}
        >
          {t("addItem")}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((f, index) => (
          <div key={f.id} className="rounded-md border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{t("itemNumber", { number: index + 1 })}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => move(index, Math.max(0, index - 1))}
                  disabled={isLoading || index === 0}
                >
                  {t("up")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => move(index, Math.min(fields.length - 1, index + 1))}
                  disabled={isLoading || index === fields.length - 1}
                >
                  {t("down")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => remove(index)}
                  disabled={isLoading || fields.length <= 1}
                >
                  {t("remove")}
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name={`items.${index}.text`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("quote")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("placeholderQuote")} rows={4} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`items.${index}.rating`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rating")}</FormLabel>
                  <p className="text-xs text-muted-foreground -mt-1 mb-1">{t("ratingHint")}</p>
                  <FormControl>
                    <StarRatingInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      label={t("rating")}
                      ariaSetRating={(n) => t("ariaSetRating", { count: n })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`items.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholderName")} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`items.${index}.role`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholderRole")} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`items.${index}.order`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("order")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface TestimonialSectionFormProps {
  section?: TestimonialSection | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TestimonialSectionForm({ section, onSuccess, onCancel }: TestimonialSectionFormProps) {
  const isEditMode = !!section;
  const [activeLang, setActiveLang] = React.useState<"en" | "vi">("en");
  const t = useTranslations("pages.testimonialSections.form");
  const tPage = useTranslations("pages.testimonialSections");

  const { data: sectionEn } = useTestimonialSection(isEditMode ? section?._id ?? null : null, {
    locale: "en",
  });
  const { data: sectionVi } = useTestimonialSection(isEditMode ? section?._id ?? null : null, {
    locale: "vi",
  });

  const createEn = useCreateTestimonialSection({ locale: "en" });
  const updateEn = useUpdateTestimonialSection({ locale: "en" });
  const updateVi = useUpdateTestimonialSection({ locale: "vi" });

  const isLoading = createEn.isPending || updateEn.isPending || updateVi.isPending;

  const testimonialSchema = React.useMemo(
    () =>
      createTestimonialSectionSchema({
        eyebrowRequired: t("eyebrowRequired"),
        titleRequired: t("titleRequired"),
        textRequired: t("textRequired"),
        nameRequired: t("nameRequired"),
        roleRequired: t("roleRequired"),
        itemsMinOne: t("itemsMinOne"),
      }),
    [t],
  );

  const defaultName = t("defaultName");

  const defaultValuesEn = React.useMemo((): TestimonialSectionFormValues => {
    if (!section) return emptyFormValues(defaultName);
    return toFormValues(section, defaultName);
  }, [section, defaultName]);

  const formEn = useForm<TestimonialSectionFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: defaultValuesEn,
  });

  const formVi = useForm<TestimonialSectionFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: emptyFormValues(defaultName),
  });

  React.useEffect(() => {
    if (!isEditMode) return;
    if (sectionEn) {
      formEn.reset(toFormValues(sectionEn, defaultName));
    }
  }, [isEditMode, sectionEn, formEn, defaultName]);

  React.useEffect(() => {
    if (!isEditMode) return;
    if (sectionVi) {
      formVi.reset(toFormValues(sectionVi, defaultName));
    }
  }, [isEditMode, sectionVi, formVi, defaultName]);

  const handleSave = async () => {
    try {
      const isEnValid = await formEn.trigger();
      if (!isEnValid) {
        setActiveLang("en");
        return;
      }
      syncEnStructureIntoVi(formEn, formVi);
      const isViValid = await formVi.trigger();
      if (!isViValid) {
        setActiveLang("vi");
        return;
      }

      const payloadEn = formToPayload(formEn.getValues());
      const payloadVi = mergeViWithEnStructure(formEn.getValues(), formVi.getValues());

      if (isEditMode && section) {
        await updateEn.mutateAsync({ id: section._id, data: payloadEn });
        await updateVi.mutateAsync({ id: section._id, data: payloadVi });
        toast.success(tPage("updated"));
      } else {
        const created = await createEn.mutateAsync(payloadEn as CreateTestimonialSectionRequest);
        if (created?._id) {
          await updateVi.mutateAsync({ id: created._id, data: payloadVi });
        }
        toast.success(tPage("created"));
      }
      onSuccess?.();
    } catch {
      toast.error(isEditMode ? tPage("updateFailed") : tPage("createFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as "en" | "vi")}>
        <TabsList>
          <TabsTrigger value="en">EN</TabsTrigger>
          <TabsTrigger value="vi">VI</TabsTrigger>
        </TabsList>

        <TabsContent value="en">
          <Form {...formEn}>
            <TestimonialSectionFields form={formEn} isLoading={isLoading} />
          </Form>
        </TabsContent>

        <TabsContent value="vi">
          <Form {...formVi}>
            <TestimonialSectionFields form={formVi} isLoading={isLoading} />
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
