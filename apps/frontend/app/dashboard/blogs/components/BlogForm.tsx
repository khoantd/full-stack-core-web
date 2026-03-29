"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateBlog, useUpdateBlog } from "@/hooks/useBlog";
import type { Blog, BlogStatus } from "@/types/blog.type";

const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
  author: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
  blog?: Blog | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BlogForm({ blog, onSuccess, onCancel }: BlogFormProps) {
  const isEditMode = !!blog;
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const isLoading = createBlog.isPending || updateBlog.isPending;

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "", description: "", image: "", status: "Draft", author: "", seoTitle: "", seoDescription: "",
    },
  });

  React.useEffect(() => {
    if (isEditMode && blog) {
      form.reset({
        title: blog.title || "",
        description: blog.description || "",
        image: blog.image || "",
        status: (blog.status as BlogStatus) || "Draft",
        author: blog.author || "",
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
      });
    } else {
      form.reset({ title: "", description: "", image: "", status: "Draft", author: "", seoTitle: "", seoDescription: "" });
    }
  }, [blog, isEditMode, form]);

  const onSubmit = async (values: BlogFormValues) => {
    try {
      const submitData = {
        title: values.title,
        description: values.description,
        status: values.status as BlogStatus,
        ...(values.image ? { image: values.image } : {}),
        ...(values.author ? { author: values.author } : {}),
        ...(values.seoTitle ? { seoTitle: values.seoTitle } : {}),
        ...(values.seoDescription ? { seoDescription: values.seoDescription } : {}),
      };

      if (isEditMode && blog) {
        await updateBlog.mutateAsync({ id: blog._id, data: submitData });
        toast.success("Blog updated successfully");
      } else {
        await createBlog.mutateAsync(submitData);
        toast.success("Blog created successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update blog" : "Failed to create blog");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input placeholder="Enter blog title" disabled={isLoading} {...field} /></FormControl>
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

          <FormField control={form.control} name="author" render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl><Input placeholder="Author name" disabled={isLoading} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Textarea placeholder="Enter blog content" disabled={isLoading} className="min-h-[120px] resize-y" {...field} />
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
            {isEditMode ? "Update Blog" : "Create Blog"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
