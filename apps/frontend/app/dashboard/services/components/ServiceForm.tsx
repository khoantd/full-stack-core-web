"use client";

import * as React from "react";
import type { Control } from "react-hook-form";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, ChevronsUpDown, Check } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCreateService, useUpdateService } from "@/hooks/useService";
import { normalizeServiceStatus } from "@/lib/normalize-service-status";
import { useCreateServiceCategory, useServiceCategories } from "@/hooks/useServiceCategory";
import { useFeatureEnabled } from "@/hooks/useFeatureEnabled";
import type { Service, ServiceContentBlock, ServiceStatus } from "@/types/service.type";

const serviceContentBlockSchema: z.ZodType<ServiceContentBlock> = z.union([
  z.object({
    type: z.literal("heading"),
    text: z.string().min(1, "Heading text is required"),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  }),
  z.object({
    type: z.literal("paragraph"),
    text: z.string().min(1, "Paragraph text is required"),
  }),
  z.object({
    type: z.literal("bullets"),
    items: z.array(z.string().min(1)).min(1, "At least one bullet is required"),
  }),
  z.object({
    type: z.literal("image"),
    url: z.string().url("Must be a valid URL"),
    alt: z.string().optional(),
  }),
]);

const serviceFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
  price: z.coerce.number().min(0).optional().or(z.literal("")),
  duration: z.string().optional(),
  category: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  content: z.array(serviceContentBlockSchema).optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

const emptyFormValues: ServiceFormValues = {
  title: "",
  description: "",
  image: "",
  status: "Draft",
  price: "",
  duration: "",
  category: "",
  categoryIds: [],
  seoTitle: "",
  seoDescription: "",
  content: [],
};

interface ServiceFormProps {
  service?: Service | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const isEditMode = !!service;
  const createService = useCreateService();
  const updateService = useUpdateService();
  const serviceCategoriesEnabled = useFeatureEnabled("serviceCategories");
  const { data: categoriesResp } = useServiceCategories(
    { page: "all", limit: 200 },
    { enabled: serviceCategoriesEnabled }
  );
  const createCategory = useCreateServiceCategory();
  const isLoading = createService.isPending || updateService.isPending;
  const categories = categoriesResp?.data ?? [];

  /**
   * Must be the initial form state on first paint for edit mode. Using only `reset()` in a useEffect
   * applies updates after mount; Radix Select often keeps an empty trigger when `value` changes
   * from that sync. The dialog remounts this component when opened (key), so these defaults stay
   * aligned with the service being edited.
   */
  const defaultValues = React.useMemo((): ServiceFormValues => {
    if (!service) return emptyFormValues;
    return {
      title: service.title || "",
      description: service.description || "",
      image: service.image || "",
      status: normalizeServiceStatus(service.status),
      price: service.price ?? "",
      duration: service.duration ?? "",
      category: service.category ?? "",
      categoryIds: service.categoryIds ?? [],
      seoTitle: service.seoTitle ?? "",
      seoDescription: service.seoDescription ?? "",
      content: service.content ?? [],
    };
  }, [service]);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
  });

  const contentArray = useFieldArray({
    control: form.control,
    name: "content",
  });

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      const submitData = {
        title: values.title,
        description: values.description,
        status: values.status as ServiceStatus,
        ...(values.image ? { image: values.image } : {}),
        ...(values.price !== "" && values.price != null ? { price: Number(values.price) } : {}),
        ...(values.duration ? { duration: values.duration } : {}),
        ...(values.category ? { category: values.category } : {}),
        ...(values.categoryIds && values.categoryIds.length > 0 ? { categoryIds: values.categoryIds } : {}),
        ...(values.seoTitle ? { seoTitle: values.seoTitle } : {}),
        ...(values.seoDescription ? { seoDescription: values.seoDescription } : {}),
        ...(values.content && values.content.length > 0 ? { content: values.content } : {}),
      };

      if (isEditMode && service) {
        await updateService.mutateAsync({ id: service._id, data: submitData });
        toast.success("Service updated successfully");
      } else {
        await createService.mutateAsync(submitData);
        toast.success("Service created successfully");
      }
      onSuccess?.();
    } catch {
      toast.error(isEditMode ? "Failed to update service" : "Failed to create service");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input placeholder="Enter service title" disabled={isLoading} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                key={service ? `${service._id}-${defaultValues.status}` : "create-status"}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
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
          )} />

          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Massage" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {serviceCategoriesEnabled && (
          <FormField control={form.control} name="categoryIds" render={({ field }) => (
            <FormItem>
              <FormLabel>Service Categories</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={isLoading}
                      className={cn("w-full justify-between", (!field.value || field.value.length === 0) && "text-muted-foreground")}
                    >
                      {field.value && field.value.length > 0 ? `${field.value.length} selected` : "Select categories"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((c) => {
                          const selected = (field.value ?? []).includes(c._id);
                          return (
                            <CommandItem
                              key={c._id}
                              value={c.name}
                              onSelect={() => {
                                const next = selected
                                  ? (field.value ?? []).filter((id) => id !== c._id)
                                  : [...(field.value ?? []), c._id];
                                field.onChange(next);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                              <span className="flex-1">{c.name}</span>
                              <span className="text-xs text-muted-foreground">{c.status}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      <div className="border-t p-2">
                        <QuickCreateCategory
                          disabled={isLoading || createCategory.isPending}
                          onCreate={async (name) => {
                            const slug = name
                              .trim()
                              .toLowerCase()
                              .replace(/['"]/g, "")
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-+|-+$/g, "")
                              .slice(0, 160);
                            const created = await createCategory.mutateAsync({ name, slug, status: "Published", sortOrder: 0 });
                            field.onChange([...(field.value ?? []), created._id]);
                          }}
                        />
                      </div>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {field.value.map((id) => {
                    const c = categories.find((x) => x._id === id);
                    return (
                      <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => field.onChange(field.value.filter((x) => x !== id))}>
                        {c?.name ?? "Category"}
                        <span className="ml-1 text-muted-foreground">×</span>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl><Input type="number" min="0" placeholder="0.00" disabled={isLoading} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl><Input placeholder="e.g. 2 hours" disabled={isLoading} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Textarea placeholder="Describe the service" disabled={isLoading} className="min-h-[120px] resize-y" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Rich content blocks</p>
              <p className="text-xs text-muted-foreground">Optional structured content to supplement the description.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoading}
              onClick={() => contentArray.append({ type: "paragraph", text: "" } as ServiceContentBlock)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add block
            </Button>
          </div>

          {contentArray.fields.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No blocks yet. Click “Add block” to start.
            </div>
          ) : (
            <div className="space-y-3">
              {contentArray.fields.map((f, index) => (
                <div key={f.id} className="rounded-md border p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`content.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="w-[180px]">
                            <FormControl>
                              <Select
                                onValueChange={(v) => {
                                  if (v === "heading") contentArray.update(index, { type: "heading", text: "Heading", level: 2 } as any);
                                  if (v === "paragraph") contentArray.update(index, { type: "paragraph", text: "" } as any);
                                  if (v === "bullets") contentArray.update(index, { type: "bullets", items: [""] } as any);
                                  if (v === "image") contentArray.update(index, { type: "image", url: "", alt: "" } as any);
                                  field.onChange(v);
                                }}
                                value={String(field.value)}
                                disabled={isLoading}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Block type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="heading">Heading</SelectItem>
                                  <SelectItem value="paragraph">Paragraph</SelectItem>
                                  <SelectItem value="bullets">Bullets</SelectItem>
                                  <SelectItem value="image">Image</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="outline" disabled={isLoading || index === 0} onClick={() => contentArray.move(index, index - 1)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          disabled={isLoading || index === contentArray.fields.length - 1}
                          onClick={() => contentArray.move(index, index + 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button type="button" size="icon" variant="ghost" disabled={isLoading} onClick={() => contentArray.remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <BlockEditor control={form.control} index={index} disabled={isLoading} />
                </div>
              ))}
            </div>
          )}
        </div>

        <FormField control={form.control} name="image" render={({ field }) => (
          <FormItem>
            <FormLabel>Image URL</FormLabel>
            <FormControl><Input type="url" placeholder="https://example.com/image.jpg" disabled={isLoading} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="seoTitle" render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title</FormLabel>
              <FormControl><Input placeholder="SEO title" disabled={isLoading} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="seoDescription" render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Description</FormLabel>
              <FormControl><Input placeholder="SEO description" disabled={isLoading} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function QuickCreateCategory({
  disabled,
  onCreate,
}: {
  disabled?: boolean;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="New category name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={disabled}
      />
      <Button
        type="button"
        size="sm"
        disabled={disabled || !name.trim()}
        onClick={async () => {
          const n = name.trim();
          setName("");
          await onCreate(n);
        }}
      >
        Create
      </Button>
    </div>
  );
}

function BlockEditor({
  control,
  index,
  disabled,
}: {
  control: Control<any>;
  index: number;
  disabled?: boolean;
}) {
  const type = useWatch({ control, name: `content.${index}.type` }) as string | undefined;
  const currentType = type ?? "paragraph";

  if (currentType === "heading") {
    return (
      <div className="grid grid-cols-5 gap-3">
        <FormField control={control} name={`content.${index}.text`} render={({ field }: any) => (
          <FormItem className="col-span-4">
            <FormLabel>Text</FormLabel>
            <FormControl><Input disabled={disabled} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name={`content.${index}.level`} render={({ field }: any) => (
          <FormItem className="col-span-1">
            <FormLabel>Level</FormLabel>
            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : "2"} disabled={disabled}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    );
  }

  if (currentType === "bullets") {
    return (
      <FormField
        control={control}
        name={`content.${index}.items`}
        render={({ field }: any) => {
          const items: string[] = Array.isArray(field.value) ? field.value : [];
          return (
            <FormItem>
              <FormLabel>Items</FormLabel>
              <div className="space-y-2">
                {items.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={v}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = [...items];
                        next[i] = e.target.value;
                        field.onChange(next);
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={disabled}
                      onClick={() => field.onChange(items.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => field.onChange([...(items.length ? items : []), ""])}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add item
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  if (currentType === "image") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <FormField control={control} name={`content.${index}.url`} render={({ field }: any) => (
          <FormItem className="col-span-2">
            <FormLabel>Image URL</FormLabel>
            <FormControl><Input type="url" disabled={disabled} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name={`content.${index}.alt`} render={({ field }: any) => (
          <FormItem className="col-span-2">
            <FormLabel>Alt text (optional)</FormLabel>
            <FormControl><Input disabled={disabled} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    );
  }

  // paragraph
  return (
    <FormField control={control} name={`content.${index}.text`} render={({ field }: any) => (
      <FormItem>
        <FormLabel>Text</FormLabel>
        <FormControl><Textarea disabled={disabled} rows={4} className="resize-y" {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}
