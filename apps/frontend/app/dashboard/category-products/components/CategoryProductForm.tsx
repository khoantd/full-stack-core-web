"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CategoryProduct } from "@/types/category-product.type";
import { useCategoryProducts } from "@/hooks/useCategoryProduct";

const categoryProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parent: z.string().optional(),
});

type CategoryProductFormValues = z.infer<typeof categoryProductSchema>;

interface CategoryProductFormProps {
  initialData?: CategoryProduct;
  onSubmit: (data: CategoryProductFormValues) => void;
  isLoading?: boolean;
}

export function CategoryProductForm({ initialData, onSubmit, isLoading }: CategoryProductFormProps) {
  const { data: allCategories } = useCategoryProducts({ limit: 100, page: "all" });
  const categories = (allCategories?.data || []).filter(c => c._id !== initialData?._id);

  const getParentId = () => {
    if (!initialData?.parent) return "none";
    if (typeof initialData.parent === "string") return initialData.parent;
    return initialData.parent._id;
  };

  const form = useForm<CategoryProductFormValues>({
    resolver: zodResolver(categoryProductSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      parent: getParentId(),
    },
  });

  const handleSubmit = (values: CategoryProductFormValues) => {
    const data: any = { name: values.name, description: values.description };
    if (values.parent && values.parent !== "none") data.parent = values.parent;
    else data.parent = null;
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="Enter category name" {...field} disabled={isLoading} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="parent" render={({ field }) => (
          <FormItem>
            <FormLabel>Parent Category (optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "none"} disabled={isLoading}>
              <FormControl><SelectTrigger><SelectValue placeholder="No parent (root)" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="none">No parent (root)</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl><Textarea placeholder="Enter category description" {...field} disabled={isLoading} rows={3} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}
