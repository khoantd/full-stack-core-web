"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateService, useUpdateService } from "@/hooks/useService";
import type { Service, ServiceStatus } from "@/types/service.type";

const serviceFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
  price: z.coerce.number().min(0).optional().or(z.literal("")),
  duration: z.string().optional(),
  category: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  service?: Service | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const isEditMode = !!service;
  const createService = useCreateService();
  const updateService = useUpdateService();
  const isLoading = createService.isPending || updateService.isPending;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "", description: "", image: "", status: "Draft",
      price: "", duration: "", category: "", seoTitle: "", seoDescription: "",
    },
  });

  React.useEffect(() => {
    if (isEditMode && service) {
      form.reset({
        title: service.title || "",
        description: service.description || "",
        image: service.image || "",
        status: (service.status as ServiceStatus) || "Draft",
        price: service.price ?? "",
        duration: service.duration || "",
        category: service.category || "",
        seoTitle: service.seoTitle || "",
        seoDescription: service.seoDescription || "",
      });
    } else {
      form.reset({ title: "", description: "", image: "", status: "Draft", price: "", duration: "", category: "", seoTitle: "", seoDescription: "" });
    }
  }, [service, isEditMode, form]);

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
        ...(values.seoTitle ? { seoTitle: values.seoTitle } : {}),
        ...(values.seoDescription ? { seoDescription: values.seoDescription } : {}),
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
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
              <FormControl><Input placeholder="e.g. Consulting" disabled={isLoading} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

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
