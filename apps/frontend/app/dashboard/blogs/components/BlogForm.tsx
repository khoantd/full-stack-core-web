"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useBlog, useCreateBlog, useUpdateBlog } from "@/hooks/useBlog";
import { useBlogCategories } from "@/hooks/useBlogCategory";
import { normalizeBlogStatus } from "@/lib/normalize-blog-status";
import type { Blog, BlogStatus, CreateBlogRequest, UpdateBlogRequest } from "@/types/blog.type";

const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
  author: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  categoryId: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const emptyFormValues: BlogFormValues = {
  title: "",
  description: "",
  image: "",
  status: "Draft",
  author: "",
  seoTitle: "",
  seoDescription: "",
  categoryId: "",
};

interface BlogFormProps {
  blog?: Blog | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function toFormValues(blog: Blog | null | undefined): BlogFormValues {
  if (!blog) return emptyFormValues;
  return {
    title: blog.title || "",
    description: blog.description || "",
    image: blog.image || "",
    status: normalizeBlogStatus(blog.status),
    author: blog.author ?? "",
    seoTitle: blog.seoTitle ?? "",
    seoDescription: blog.seoDescription ?? "",
    categoryId: blog.categoryId ?? "",
  };
}

function toSubmitPayload(
  values: BlogFormValues,
  opts?: {
    /** When false, shared root `image` is omitted so a second locale PUT cannot overwrite it */
    includeImage?: boolean;
    /** Empty image: send null (persist clear) on update, or omit field on create */
    imageClearMode?: "unset-with-null" | "omit";
    /**
     * When false, `categoryId` is omitted from the payload.
     * categoryId is a shared non-translatable field — only the EN form controls it,
     * so the VI update must never send it or it will overwrite the EN change.
     */
    includeCategoryId?: boolean;
  },
): CreateBlogRequest | UpdateBlogRequest {
  const includeImage = opts?.includeImage !== false;
  const imageClearMode = opts?.imageClearMode ?? "unset-with-null";
  const includeCategoryId = opts?.includeCategoryId !== false;

  const base: CreateBlogRequest | UpdateBlogRequest = {
    title: values.title,
    description: values.description,
    status: values.status as BlogStatus,
    ...(values.author ? { author: values.author } : {}),
    ...(values.seoTitle ? { seoTitle: values.seoTitle } : {}),
    ...(values.seoDescription ? { seoDescription: values.seoDescription } : {}),
    ...(includeCategoryId
      ? values.categoryId
        ? { categoryId: values.categoryId }
        : { categoryId: null }
      : {}),
  };

  if (!includeImage) {
    return base;
  }

  if (values.image === "") {
    if (imageClearMode === "omit") {
      return base;
    }
    return { ...base, image: null };
  }

  if (values.image) {
    return { ...base, image: values.image };
  }

  return base;
}

function BlogFields({
  form,
  peerForm,
  isLoading,
  isEnTab,
}: {
  form: UseFormReturn<BlogFormValues>;
  /** Keeps the other locale’s `image` in sync so the shared URL is not stale on save */
  peerForm?: UseFormReturn<BlogFormValues>;
  isLoading: boolean;
  /** Category selector only shown on the EN tab (shared non-translatable field) */
  isEnTab?: boolean;
}) {
  const { data: categoriesData } = useBlogCategories({ page: "all", status: "Published" }, { enabled: isEnTab });
  const categories = categoriesData?.data ?? [];

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
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
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Author name" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {isEnTab && (
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                value={field.value || "__none__"}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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
                placeholder="Enter blog content"
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
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(e);
                  peerForm?.setValue("image", v, {
                    shouldValidate: false,
                    shouldDirty: true,
                  });
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="seoTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title</FormLabel>
              <FormControl>
                <Input placeholder="SEO title" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seoDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Description</FormLabel>
              <FormControl>
                <Input placeholder="SEO description" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default function BlogForm({ blog, onSuccess, onCancel }: BlogFormProps) {
  const isEditMode = !!blog;
  const [activeLang, setActiveLang] = React.useState<"en" | "vi">("en");

  const { data: blogEn } = useBlog(isEditMode ? blog?._id ?? null : null, { locale: "en" });
  const { data: blogVi } = useBlog(isEditMode ? blog?._id ?? null : null, { locale: "vi" });

  const createBlogEn = useCreateBlog({ locale: "en" });
  const updateBlogEn = useUpdateBlog({ locale: "en" });
  const updateBlogVi = useUpdateBlog({ locale: "vi" });

  const isLoading =
    createBlogEn.isPending || updateBlogEn.isPending || updateBlogVi.isPending;

  /**
   * Must be the initial form state on first paint for edit mode. Using only the `values` prop applies
   * updates in a useEffect after mount; Radix Select often keeps an empty trigger when `value` changes
   * from that sync. BlogFormDialog remounts this component when the dialog opens (key), so these
   * defaults stay aligned with the blog being edited.
   */
  const defaultValuesEn = React.useMemo((): BlogFormValues => {
    if (!blog) return emptyFormValues;
    // First paint: use the blog provided by the table (current locale) as a fallback.
    return toFormValues(blog);
  }, [blog]);

  const formEn = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: defaultValuesEn,
  });

  const formVi = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: emptyFormValues,
  });

  React.useEffect(() => {
    if (!isEditMode) return;
    if (blogEn) {
      formEn.reset(toFormValues(blogEn));
    }
  }, [isEditMode, blogEn, formEn]);

  React.useEffect(() => {
    if (!isEditMode) return;
    if (blogVi) {
      formVi.reset(toFormValues(blogVi));
    }
  }, [isEditMode, blogVi, formVi]);

  const handleSave = async () => {
    try {
      const isEnValid = await formEn.trigger();
      const isViValid = await formVi.trigger();

      if (!isEnValid) {
        setActiveLang("en");
        return;
      }
      if (!isViValid) {
        setActiveLang("vi");
        return;
      }

      const payloadEn = toSubmitPayload(formEn.getValues(), {
        includeImage: true,
        imageClearMode: isEditMode ? "unset-with-null" : "omit",
      });
      const payloadVi = toSubmitPayload(formVi.getValues(), { includeImage: false, includeCategoryId: false });

      if (isEditMode && blog) {
        await updateBlogEn.mutateAsync({ id: blog._id, data: payloadEn });
        await updateBlogVi.mutateAsync({ id: blog._id, data: payloadVi });
        toast.success("Blog updated successfully");
      } else {
        const created = await createBlogEn.mutateAsync(payloadEn as CreateBlogRequest);
        if (created?._id) {
          await updateBlogVi.mutateAsync({ id: created._id, data: payloadVi });
        }
        toast.success("Blog created successfully");
      }

      onSuccess?.();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update blog" : "Failed to create blog");
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
            <BlogFields form={formEn} peerForm={formVi} isLoading={isLoading} isEnTab />
          </Form>
        </TabsContent>

        <TabsContent value="vi">
          <Form {...formVi}>
            <BlogFields form={formVi} peerForm={formEn} isLoading={isLoading} />
          </Form>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Update Blog" : "Create Blog"}
        </Button>
      </div>
    </div>
  );
}
