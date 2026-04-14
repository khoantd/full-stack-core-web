"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import {
  useCreateLandingPage,
  useLandingPage,
  useUpdateLandingPage,
} from "@/hooks/useLandingPages";
import type { LandingPage, LandingPageStatus } from "@/types/landing.type";
import {
  landingFormSchema,
  createEmptySection,
  type LandingFormValues,
} from "../lib/landing-form-schema";
import { SortableSectionList } from "./sortable-section-list";
import { SectionFields } from "./section-fields";
import { useTranslations } from "next-intl";

const SECTION_TYPES: LandingFormValues["sections"][number]["type"][] = [
  "hero",
  "features",
  "cta",
  "stats",
  "faq",
  "paragraph",
  "footer",
];

function normalizeSlugInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

const emptyValues: LandingFormValues = {
  slug: "",
  title: "",
  status: "Draft",
  isDefault: false,
  seoTitle: "",
  seoDescription: "",
  sections: [],
};

function toFormValues(page: LandingPage | null | undefined): LandingFormValues {
  if (!page) return emptyValues;
  const sections = (page.sections ?? []) as LandingFormValues["sections"];
  return {
    slug: page.slug ?? "",
    title: page.title ?? "",
    status: (page.status as LandingPageStatus) ?? "Draft",
    isDefault: !!page.isDefault,
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
    sections: sections.length ? sections : [],
  };
}

interface LandingEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, dialog loads this page for editing */
  landingId: string | null;
  onSaved: () => void;
}

export function LandingEditorDialog({
  open,
  onOpenChange,
  landingId,
  onSaved,
}: LandingEditorDialogProps) {
  const t = useTranslations("pages.landings");
  const [editLocale, setEditLocale] = React.useState<"en" | "vi">("en");

  const isEdit = !!landingId;
  const { data: pageData, isLoading: isLoadingPage } = useLandingPage(landingId, {
    locale: editLocale,
    enabled: open && isEdit,
  });

  const createMutation = useCreateLandingPage();
  const updateMutation = useUpdateLandingPage();

  const form = useForm<LandingFormValues>({
    resolver: zodResolver(landingFormSchema),
    defaultValues: emptyValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "sections",
    keyName: "_fieldKey",
  });

  React.useEffect(() => {
    if (!open) {
      form.reset(emptyValues);
      setEditLocale("en");
      return;
    }
    if (isEdit) {
      if (pageData) {
        form.reset(toFormValues(pageData as LandingPage));
      }
      return;
    }
    form.reset(emptyValues);
  }, [open, isEdit, pageData, landingId, editLocale, form.reset]);

  const watchedSections = form.watch("sections");
  const sectionIds = React.useMemo(
    () => (watchedSections ?? []).map((s) => s.id),
    [watchedSections],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      slug: normalizeSlugInput(values.slug),
      title: values.title,
      status: values.status,
      isDefault: values.isDefault,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
      sections: values.sections,
    };

    try {
      if (isEdit && landingId) {
        await updateMutation.mutateAsync({
          id: landingId,
          data: payload,
          locale: editLocale,
        });
      } else {
        await createMutation.mutateAsync({
          data: payload,
          locale: editLocale,
        });
      }
      toast.success(t("saved"));
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t("saveFailed");
      toast.error(typeof message === "string" ? message : t("saveFailed"));
    }
  });

  const formKey = open ? (isEdit && landingId ? `edit-${landingId}-${editLocale}` : "create") : "closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[960px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription>{t("formDescription")}</DialogDescription>
        </DialogHeader>

        {isEdit && isLoadingPage ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form} key={formKey}>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Tabs
                  value={editLocale}
                  onValueChange={(v) => setEditLocale(v as "en" | "vi")}
                >
                  <TabsList>
                    <TabsTrigger value="en" type="button">
                      {t("localeEn")}
                    </TabsTrigger>
                    <TabsTrigger value="vi" type="button">
                      {t("localeVi")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("slug")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isEdit}
                          autoComplete="off"
                          onBlur={(e) => {
                            field.onBlur();
                            if (!isEdit) {
                              field.onChange(normalizeSlugInput(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>{t("slugHint")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pageTitle")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("defaultPage")}</FormLabel>
                        <FormDescription>{t("defaultPageHint")}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>{t("seoTitle")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>{t("seoDescription")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">{t("sectionsTitle")}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <PlusCircledIcon className="mr-1 size-4" />
                        {t("addSection")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {SECTION_TYPES.map((st) => (
                        <DropdownMenuItem
                          key={st}
                          className="cursor-pointer"
                          onClick={() => append(createEmptySection(st))}
                        >
                          {t(`sectionTypes.${st}`)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {fields.length === 0 ? (
                  <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                    {t("sectionEmpty")}
                  </p>
                ) : (
                  <SortableSectionList
                    form={form}
                    fields={fields}
                    move={move}
                    sectionIds={sectionIds}
                    renderSection={(index) => (
                      <SectionFields
                        index={index}
                        form={form}
                        onRemove={() => remove(index)}
                      />
                    )}
                  />
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {t("save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
