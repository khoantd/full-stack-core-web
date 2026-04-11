"use client";

import * as React from "react";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  useCreateFaqSection,
  useFaqSection,
  useUpdateFaqSection,
} from "@/hooks/useFaqSection";
import type {
  CreateFaqSectionRequest,
  FaqItem,
  FaqSection,
  FaqSectionStatus,
  UpdateFaqSectionRequest,
} from "@/types/faq-section.type";

type ItemForm = {
  question: string;
  answer: string;
  order: number;
};

type FaqSchemaMessages = {
  eyebrowRequired: string;
  titleRequired: string;
  questionRequired: string;
  answerRequired: string;
  itemsMinOne: string;
};

function createFaqSectionSchema(msgs: FaqSchemaMessages) {
  const itemSchema = z.object({
    question: z.string().min(1, msgs.questionRequired),
    answer: z.string().min(1, msgs.answerRequired),
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

type FaqSectionFormValues = z.infer<ReturnType<typeof createFaqSectionSchema>>;

function itemsToForm(items: FaqItem[] | undefined): ItemForm[] {
  const sorted = [...(items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return sorted.map((it, idx) => ({
    question: it.question ?? "",
    answer: it.answer ?? "",
    order: typeof it.order === "number" ? it.order : idx,
  }));
}

function formToPayload(values: FaqSectionFormValues): CreateFaqSectionRequest | UpdateFaqSectionRequest {
  return {
    eyebrow: values.eyebrow.trim(),
    title: values.title.trim(),
    slug: values.slug?.trim() || undefined,
    status: values.status as FaqSectionStatus,
    items: values.items
      .map((it, idx) => ({
        question: it.question.trim(),
        answer: it.answer.trim(),
        order: typeof it.order === "number" ? it.order : idx,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
}

function mergeViWithEnStructure(
  en: FaqSectionFormValues,
  vi: FaqSectionFormValues,
): UpdateFaqSectionRequest {
  const structural = formToPayload(en) as CreateFaqSectionRequest;
  return {
    ...structural,
    eyebrow: vi.eyebrow.trim(),
    title: vi.title.trim(),
    items: structural.items.map((item, i) => {
      const vit = vi.items[i];
      if (!vit) return item;
      return {
        ...item,
        question: vit.question.trim(),
        answer: vit.answer.trim(),
      };
    }),
  };
}

function syncEnStructureIntoVi(
  formEn: UseFormReturn<FaqSectionFormValues>,
  formVi: UseFormReturn<FaqSectionFormValues>,
) {
  const en = formEn.getValues();
  formVi.setValue("slug", en.slug);
  formVi.setValue("status", en.status);
  const enItems = en.items ?? [];
  const viItems = formVi.getValues("items") ?? [];
  const next = enItems.map((ei, i) => ({
    question: viItems[i]?.question ?? "",
    answer: viItems[i]?.answer ?? "",
    order: ei.order,
  }));
  formVi.setValue("items", next);
}

function toFormValues(section: FaqSection | null | undefined, defaultQuestion: string): FaqSectionFormValues {
  if (!section) {
    return {
      eyebrow: "",
      title: "",
      slug: "",
      status: "Draft",
      items: [{ question: defaultQuestion, answer: "", order: 0 }],
    };
  }
  return {
    eyebrow: section.eyebrow || "",
    title: section.title || "",
    slug: section.slug ?? "",
    status: (section.status as FaqSectionStatus) ?? "Draft",
    items: section.items?.length
      ? itemsToForm(section.items)
      : [{ question: defaultQuestion, answer: "", order: 0 }],
  };
}

const emptyFormValues = (defaultQuestion: string): FaqSectionFormValues => ({
  eyebrow: "",
  title: "",
  slug: "",
  status: "Draft",
  items: [{ question: defaultQuestion, answer: "", order: 0 }],
});

function FaqSectionFields({
  form,
  isLoading,
}: {
  form: UseFormReturn<FaqSectionFormValues>;
  isLoading: boolean;
}) {
  const t = useTranslations("pages.faqSections.form");
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
              question: t("newItemQuestion", { number: fields.length + 1 }),
              answer: "",
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
              name={`items.${index}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("question")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholderQuestion")} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`items.${index}.answer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("answer")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("placeholderAnswer")} rows={4} {...field} disabled={isLoading} />
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

interface FaqSectionFormProps {
  section?: FaqSection | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FaqSectionForm({ section, onSuccess, onCancel }: FaqSectionFormProps) {
  const isEditMode = !!section;
  const [activeLang, setActiveLang] = React.useState<"en" | "vi">("en");
  const t = useTranslations("pages.faqSections.form");
  const tPage = useTranslations("pages.faqSections");

  const { data: sectionEn } = useFaqSection(isEditMode ? section?._id ?? null : null, { locale: "en" });
  const { data: sectionVi } = useFaqSection(isEditMode ? section?._id ?? null : null, { locale: "vi" });

  const createEn = useCreateFaqSection({ locale: "en" });
  const updateEn = useUpdateFaqSection({ locale: "en" });
  const updateVi = useUpdateFaqSection({ locale: "vi" });

  const isLoading = createEn.isPending || updateEn.isPending || updateVi.isPending;

  const faqSchema = React.useMemo(
    () =>
      createFaqSectionSchema({
        eyebrowRequired: t("eyebrowRequired"),
        titleRequired: t("titleRequired"),
        questionRequired: t("questionRequired"),
        answerRequired: t("answerRequired"),
        itemsMinOne: t("itemsMinOne"),
      }),
    [t],
  );

  const defaultQuestion = t("defaultQuestion");

  const defaultValuesEn = React.useMemo((): FaqSectionFormValues => {
    if (!section) return emptyFormValues(defaultQuestion);
    return toFormValues(section, defaultQuestion);
  }, [section, defaultQuestion]);

  const formEn = useForm<FaqSectionFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: defaultValuesEn,
  });

  const formVi = useForm<FaqSectionFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: emptyFormValues(defaultQuestion),
  });

  React.useEffect(() => {
    if (!isEditMode) return;
    if (sectionEn) {
      formEn.reset(toFormValues(sectionEn, defaultQuestion));
    }
  }, [isEditMode, sectionEn, formEn, defaultQuestion]);

  React.useEffect(() => {
    if (!isEditMode) return;
    if (sectionVi) {
      formVi.reset(toFormValues(sectionVi, defaultQuestion));
    }
  }, [isEditMode, sectionVi, formVi, defaultQuestion]);

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
        const created = await createEn.mutateAsync(payloadEn as CreateFaqSectionRequest);
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
            <FaqSectionFields form={formEn} isLoading={isLoading} />
          </Form>
        </TabsContent>

        <TabsContent value="vi">
          <Form {...formVi}>
            <FaqSectionFields form={formVi} isLoading={isLoading} />
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
