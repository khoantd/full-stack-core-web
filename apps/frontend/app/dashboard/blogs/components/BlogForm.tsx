"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ImageIcon } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { useCreateBlog, useUpdateBlog } from "@/hooks/useBlog";
import type { Blog } from "@/types/blog.type";

// Form validation schema matching backend requirements
const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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
      title: "",
      description: "",
      image: "",
    },
  });

  // Reset form when blog changes
  React.useEffect(() => {
    if (isEditMode && blog) {
      form.reset({
        title: blog.title || "",
        description: blog.description || "",
        image: blog.image || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        image: "",
      });
    }
  }, [blog, isEditMode, form]);

  const imageUrl = form.watch("image");

  const onSubmit = async (values: BlogFormValues) => {
    try {
      // Clean up empty image field
      const submitData = {
        title: values.title,
        description: values.description,
        ...(values.image ? { image: values.image } : {}),
      };

      if (isEditMode && blog) {
        await updateBlog.mutateAsync({
          id: blog._id,
          data: submitData,
        });
        toast.success("Blog updated successfully");
      } else {
        await createBlog.mutateAsync(submitData);
        toast.success("Blog created successfully");
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(isEditMode ? "Failed to update blog" : "Failed to create blog", {
        description: errorMessage,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter blog title" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter blog description"
                  disabled={isLoading}
                  className="min-h-[120px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-2 relative">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-32 w-auto rounded-md object-cover border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const fallback = (e.target as HTMLImageElement).nextElementSibling;
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = "block";
                      const fallback = (e.target as HTMLImageElement).nextElementSibling;
                      if (fallback) fallback.classList.add("hidden");
                    }}
                  />
                  <div className="hidden h-32 w-32 rounded-md bg-muted flex items-center justify-center border">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">Failed to load</p>
                    </div>
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Blog" : "Create Blog"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
