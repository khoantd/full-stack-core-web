"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LandingFormValues } from "../lib/landing-form-schema";
import { useTranslations } from "next-intl";

export function SectionFields({
  index,
  form,
  onRemove,
}: {
  index: number;
  form: UseFormReturn<LandingFormValues>;
  onRemove: () => void;
}) {
  const t = useTranslations("pages.landings");
  const type = useWatch({
    control: form.control,
    name: `sections.${index}.type`,
  });

  if (!type) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t(`sectionTypes.${type}`)}
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-destructive" onClick={onRemove}>
          <Trash2 className="size-4" />
          <span className="sr-only">{t("removeSection")}</span>
        </Button>
      </div>

      {type === "hero" && <HeroFields index={index} form={form} />}
      {type === "features" && <FeaturesFields index={index} form={form} />}
      {type === "cta" && <CtaFields index={index} form={form} />}
      {type === "stats" && <StatsFields index={index} form={form} />}
      {type === "faq" && <FaqFields index={index} form={form} />}
      {type === "paragraph" && <ParagraphFields index={index} form={form} />}
    </div>
  );
}

function HeroFields({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<LandingFormValues>;
}) {
  const t = useTranslations("pages.landings.hero");
  const base = `sections.${index}` as const;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField
        control={form.control}
        name={`${base}.headline`}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t("headline")}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${base}.subheadline`}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t("subheadline")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${base}.image`}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t("image")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${base}.primaryCtaLabel`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("primaryCtaLabel")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${base}.primaryCtaHref`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("primaryCtaHref")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${base}.secondaryCtaLabel`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("secondaryCtaLabel")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${base}.secondaryCtaHref`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("secondaryCtaHref")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function FeaturesFields({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<LandingFormValues>;
}) {
  const t = useTranslations("pages.landings.features");
  const base = `sections.${index}` as const;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${base}.items`,
  });

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={`${base}.heading`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("heading")}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {fields.map((f, itemIndex) => (
        <div key={f.id} className="rounded-md border p-3 space-y-2">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-destructive"
              onClick={() => remove(itemIndex)}
              disabled={fields.length <= 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <FormField
            control={form.control}
            name={`${base}.items.${itemIndex}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("itemTitle")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${base}.items.${itemIndex}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("itemDescription")}</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${base}.items.${itemIndex}.icon`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("itemIcon")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ title: "" })}
      >
        <Plus className="size-4 mr-1" />
        {t("addItem")}
      </Button>
    </div>
  );
}

function CtaFields({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<LandingFormValues>;
}) {
  const t = useTranslations("pages.landings.cta");
  const base = `sections.${index}` as const;
  return (
    <div className="grid gap-3">
      <FormField
        control={form.control}
        name={`${base}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("title")}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${base}.body`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("body")}</FormLabel>
            <FormControl>
              <Textarea {...field} value={field.value ?? ""} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name={`${base}.buttonLabel`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("buttonLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${base}.buttonHref`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("buttonHref")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function StatsFields({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<LandingFormValues>;
}) {
  const t = useTranslations("pages.landings.stats");
  const base = `sections.${index}` as const;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${base}.items`,
  });

  return (
    <div className="space-y-3">
      {fields.map((f, itemIndex) => (
        <div key={f.id} className="flex gap-2 items-start">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <FormField
              control={form.control}
              name={`${base}.items.${itemIndex}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${base}.items.${itemIndex}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("value")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-8 shrink-0 text-destructive"
            onClick={() => remove(itemIndex)}
            disabled={fields.length <= 1}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ label: "", value: "" })}>
        <Plus className="size-4 mr-1" />
        {t("addItem")}
      </Button>
    </div>
  );
}

function FaqFields({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<LandingFormValues>;
}) {
  const t = useTranslations("pages.landings.faq");
  const base = `sections.${index}` as const;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${base}.items`,
  });

  return (
    <div className="space-y-3">
      {fields.map((f, itemIndex) => (
        <div key={f.id} className="rounded-md border p-3 space-y-2">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-destructive"
              onClick={() => remove(itemIndex)}
              disabled={fields.length <= 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <FormField
            control={form.control}
            name={`${base}.items.${itemIndex}.question`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("question")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${base}.items.${itemIndex}.answer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("answer")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ question: "", answer: "" })}
      >
        <Plus className="size-4 mr-1" />
        {t("addItem")}
      </Button>
    </div>
  );
}

function ParagraphFields({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<LandingFormValues>;
}) {
  const t = useTranslations("pages.landings.paragraph");
  const base = `sections.${index}` as const;
  return (
    <FormField
      control={form.control}
      name={`${base}.body`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("body")}</FormLabel>
          <FormControl>
            <Textarea {...field} rows={6} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
