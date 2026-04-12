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
  useCreatePricing,
  usePricing,
  useUpdatePricing,
} from "@/hooks/usePricing";
import type {
  CreatePricingRequest,
  Pricing,
  PricingCurrency,
  PricingStatus,
  PricingTier,
  UpdatePricingRequest,
} from "@/types/pricing.type";

type TierForm = {
  name: string;
  currency: PricingCurrency;
  price: string;
  description?: string;
  featuresText?: string;
  order: number;
};

type PricingSchemaMessages = {
  tierNameRequired: string;
  priceRequired: string;
  titleRequired: string;
  tiersMinOne: string;
  invalidUsdAmount: string;
  invalidVndAmount: string;
};

function createPricingSchema(msgs: PricingSchemaMessages) {
  const tierSchema = z.object({
    name: z.string().min(1, msgs.tierNameRequired),
    currency: z.enum(["VND", "USD"]),
    price: z.string().min(1, msgs.priceRequired),
    description: z.string().optional(),
    featuresText: z.string().optional(),
    order: z.number().min(0),
  });

  return z
    .object({
      title: z.string().min(1, msgs.titleRequired),
      slug: z.string().optional(),
      status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
      tiers: z.array(tierSchema).min(1, msgs.tiersMinOne),
    })
    .superRefine((val, ctx) => {
      val.tiers.forEach((t, idx) => {
        const unit = parseUnitAmount(t.currency, t.price);
        if (unit == null || unit < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t.currency === "USD" ? msgs.invalidUsdAmount : msgs.invalidVndAmount,
            path: ["tiers", idx, "price"],
          });
        }
      });
    });
}

type PricingFormValues = z.infer<ReturnType<typeof createPricingSchema>>;

function parseUnitAmount(currency: PricingCurrency, input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;
  if (currency === "USD") {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  return n;
}

function unitAmountToDisplay(currency: PricingCurrency, unitAmount: number): string {
  if (currency === "USD") return (unitAmount / 100).toFixed(2);
  return String(unitAmount);
}

function tiersToForm(tiers: PricingTier[] | undefined): TierForm[] {
  const sorted = [...(tiers ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return sorted.map((t, idx) => ({
    name: t.name ?? "",
    currency: t.currency ?? "USD",
    price: unitAmountToDisplay(t.currency, t.unitAmount ?? 0),
    description: t.description ?? "",
    featuresText: (t.features ?? []).join("\n"),
    order: typeof t.order === "number" ? t.order : idx,
  }));
}

function formToPayload(values: PricingFormValues): CreatePricingRequest | UpdatePricingRequest {
  return {
    title: values.title.trim(),
    slug: values.slug?.trim() || undefined,
    status: values.status as PricingStatus,
    tiers: values.tiers
      .map((t, idx) => {
        const unitAmount = parseUnitAmount(t.currency, t.price) ?? 0;
        const features = (t.featuresText ?? "")
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);
        return {
          name: t.name.trim(),
          currency: t.currency,
          unitAmount,
          description: t.description?.trim() || undefined,
          features: features.length ? features : undefined,
          order: typeof t.order === "number" ? t.order : idx,
        };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
}

/** VI locale payload: same prices/structure as EN, text fields from the VI form. */
function mergeViWithEnStructure(
  en: PricingFormValues,
  vi: PricingFormValues,
): UpdatePricingRequest {
  const structural = formToPayload(en) as CreatePricingRequest;
  return {
    ...structural,
    title: vi.title.trim(),
    tiers: structural.tiers.map((tier, i) => {
      const vt = vi.tiers[i];
      if (!vt) return tier;
      const features = (vt.featuresText ?? "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
      return {
        ...tier,
        name: vt.name.trim(),
        description: vt.description?.trim() || undefined,
        features: features.length ? features : undefined,
      };
    }),
  };
}

function syncEnStructureIntoVi(
  formEn: UseFormReturn<PricingFormValues>,
  formVi: UseFormReturn<PricingFormValues>,
) {
  const en = formEn.getValues();
  formVi.setValue("slug", en.slug);
  formVi.setValue("status", en.status);
  const enTiers = en.tiers ?? [];
  const viTiers = formVi.getValues("tiers") ?? [];
  const next = enTiers.map((et, i) => ({
    name: viTiers[i]?.name ?? "",
    currency: et.currency,
    price: et.price,
    description: viTiers[i]?.description ?? "",
    featuresText: viTiers[i]?.featuresText ?? "",
    order: et.order,
  }));
  formVi.setValue("tiers", next);
}

function toFormValues(pricing: Pricing | null | undefined, defaultTierName: string): PricingFormValues {
  if (!pricing) {
    return {
      title: "",
      slug: "",
      status: "Draft",
      tiers: [
        {
          name: defaultTierName,
          currency: "USD",
          price: "0.00",
          description: "",
          featuresText: "",
          order: 0,
        },
      ],
    };
  }
  return {
    title: pricing.title || "",
    slug: pricing.slug ?? "",
    status: (pricing.status as PricingStatus) ?? "Draft",
    tiers: pricing.tiers?.length ? tiersToForm(pricing.tiers) : [
      {
        name: defaultTierName,
        currency: "USD",
        price: "0.00",
        description: "",
        featuresText: "",
        order: 0,
      },
    ],
  };
}

const emptyFormValues = (defaultTierName: string): PricingFormValues => ({
  title: "",
  slug: "",
  status: "Draft",
  tiers: [
    {
      name: defaultTierName,
      currency: "USD",
      price: "0.00",
      description: "",
      featuresText: "",
      order: 0,
    },
  ],
});

function PricingFields({
  form,
  isLoading,
}: {
  form: UseFormReturn<PricingFormValues>;
  isLoading: boolean;
}) {
  const t = useTranslations("pages.pricings.form");
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  return (
    <div className="space-y-4">
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
          <p className="text-sm font-medium">{t("tiersSection")}</p>
          <p className="text-xs text-muted-foreground">{t("tiersHint")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: t("newTierName", { number: fields.length + 1 }),
              currency: "USD",
              price: "0.00",
              description: "",
              featuresText: "",
              order: fields.length,
            })
          }
          disabled={isLoading}
        >
          {t("addTier")}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((f, index) => (
          <div key={f.id} className="rounded-md border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{t("tierNumber", { number: index + 1 })}</p>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`tiers.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("placeholderTierName")} {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tiers.${index}.currency`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("currency")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("currency")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VND">VND</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`tiers.${index}.price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("price")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          form.watch(`tiers.${index}.currency`) === "USD"
                            ? t("placeholderPriceUsd")
                            : t("placeholderPriceVnd")
                        }
                        inputMode="decimal"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tiers.${index}.order`}
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

            <FormField
              control={form.control}
              name={`tiers.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholderShortDescription")} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`tiers.${index}.featuresText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("features")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("placeholderFeatures")} rows={4} {...field} disabled={isLoading} />
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

interface PricingFormProps {
  pricing?: Pricing | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PricingForm({ pricing, onSuccess, onCancel }: PricingFormProps) {
  const isEditMode = !!pricing;
  const [activeLang, setActiveLang] = React.useState<"en" | "vi">("en");
  const t = useTranslations("pages.pricings.form");
  const tPage = useTranslations("pages.pricings");

  const { data: pricingEn } = usePricing(isEditMode ? pricing?._id ?? null : null, { locale: "en" });
  const { data: pricingVi } = usePricing(isEditMode ? pricing?._id ?? null : null, { locale: "vi" });

  const createEn = useCreatePricing({ locale: "en" });
  const updateEn = useUpdatePricing({ locale: "en" });
  const updateVi = useUpdatePricing({ locale: "vi" });

  const isLoading = createEn.isPending || updateEn.isPending || updateVi.isPending;

  const pricingSchema = React.useMemo(
    () =>
      createPricingSchema({
        tierNameRequired: t("tierNameRequired"),
        priceRequired: t("priceRequired"),
        titleRequired: t("titleRequired"),
        tiersMinOne: t("tiersMinOne"),
        invalidUsdAmount: t("invalidUsdAmount"),
        invalidVndAmount: t("invalidVndAmount"),
      }),
    [t],
  );

  const defaultTierName = t("defaultTierName");

  const defaultValuesEn = React.useMemo((): PricingFormValues => {
    if (!pricing) return emptyFormValues(defaultTierName);
    return toFormValues(pricing, defaultTierName);
  }, [pricing, defaultTierName]);

  const formEn = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: defaultValuesEn,
  });

  const formVi = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: emptyFormValues(defaultTierName),
  });

  React.useEffect(() => {
    if (!isEditMode) return;
    if (pricingEn) {
      formEn.reset(toFormValues(pricingEn, defaultTierName));
    }
  }, [isEditMode, pricingEn, formEn, defaultTierName]);

  React.useEffect(() => {
    if (!isEditMode) return;
    if (pricingVi) {
      formVi.reset(toFormValues(pricingVi, defaultTierName));
    }
  }, [isEditMode, pricingVi, formVi, defaultTierName]);

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

      if (isEditMode && pricing) {
        await updateEn.mutateAsync({ id: pricing._id, data: payloadEn });
        await updateVi.mutateAsync({ id: pricing._id, data: payloadVi });
        toast.success(tPage("updated"));
      } else {
        const created = await createEn.mutateAsync(payloadEn as CreatePricingRequest);
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
            <PricingFields form={formEn} isLoading={isLoading} />
          </Form>
        </TabsContent>

        <TabsContent value="vi">
          <Form {...formVi}>
            <PricingFields form={formVi} isLoading={isLoading} />
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
