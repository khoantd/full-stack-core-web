"use client";

import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  price: string; // display string; converted to unitAmount on submit
  description?: string;
  featuresText?: string; // newline-separated
  order: number;
};

const tierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  currency: z.enum(["VND", "USD"]),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  featuresText: z.string().optional(),
  order: z.number().min(0),
});

const pricingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
  tiers: z.array(tierSchema).min(1, "Add at least one tier"),
}).superRefine((val, ctx) => {
  val.tiers.forEach((t, idx) => {
    const unit = parseUnitAmount(t.currency, t.price);
    if (unit == null || unit < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t.currency === "USD" ? "Enter a valid USD amount (e.g. 19.99)" : "Enter a valid VND amount (whole number)",
        path: ["tiers", idx, "price"],
      });
    }
  });
});

type PricingFormValues = z.infer<typeof pricingSchema>;

function parseUnitAmount(currency: PricingCurrency, input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;
  if (currency === "USD") {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
  }
  // VND
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

interface PricingFormProps {
  initialData?: Pricing | null;
  onSubmit: (payload: CreatePricingRequest | UpdatePricingRequest) => void;
  isLoading?: boolean;
}

export function PricingForm({ initialData, onSubmit, isLoading }: PricingFormProps) {
  const defaultTiers = useMemo<TierForm[]>(
    () => (initialData?.tiers?.length ? tiersToForm(initialData.tiers) : [{ name: "Basic", currency: "USD", price: "0.00", description: "", featuresText: "", order: 0 }]),
    [initialData],
  );

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      status: (initialData?.status as PricingStatus) ?? "Draft",
      tiers: defaultTiers,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(formToPayload(values)))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Car Wash Packages" {...field} disabled={isLoading} />
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
                <FormLabel>Slug (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. car-wash" {...field} disabled={isLoading} />
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
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Tiers</p>
            <p className="text-xs text-muted-foreground">Prices support both VND and USD.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: `Tier ${fields.length + 1}`, currency: "USD", price: "0.00", description: "", featuresText: "", order: fields.length })}
            disabled={isLoading}
          >
            Add tier
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((f, index) => (
            <div key={f.id} className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Tier #{index + 1}</p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => move(index, Math.max(0, index - 1))}
                    disabled={isLoading || index === 0}
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => move(index, Math.min(fields.length - 1, index + 1))}
                    disabled={isLoading || index === fields.length - 1}
                  >
                    Down
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(index)}
                    disabled={isLoading || fields.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`tiers.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Basic" {...field} disabled={isLoading} />
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
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Currency" />
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
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={form.getValues(`tiers.${index}.currency`) === "USD" ? "e.g. 19.99" : "e.g. 200000"}
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
                      <FormLabel>Order</FormLabel>
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Short description" {...field} disabled={isLoading} />
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
                    <FormLabel>Features (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={"One feature per line\nExample:\n- Free pickup\n- 24/7 support"}
                        rows={4}
                        {...field}
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

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}

