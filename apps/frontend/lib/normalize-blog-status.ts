import type { Blog, BlogStatus } from "@/types/blog.type";

/**
 * Maps API / DB status strings to the canonical values expected by forms and Select items.
 */
export function normalizeBlogStatus(value: unknown): BlogStatus {
  if (value == null || value === "") return "Draft";
  switch (String(value).trim().toLowerCase()) {
    case "published":
      return "Published";
    case "archived":
      return "Archived";
    case "draft":
      return "Draft";
    default:
      return "Draft";
  }
}

export function mapApiBlog(raw: unknown): Blog {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    _id: String(r._id ?? ""),
    title: String(r.title ?? ""),
    description: String(r.description ?? ""),
    image: r.image != null && r.image !== "" ? String(r.image) : undefined,
    status: normalizeBlogStatus(r.status),
    author: r.author != null && r.author !== "" ? String(r.author) : undefined,
    publishedAt:
      r.publishedAt != null && r.publishedAt !== "" ? String(r.publishedAt) : undefined,
    seoTitle: r.seoTitle != null && r.seoTitle !== "" ? String(r.seoTitle) : undefined,
    seoDescription:
      r.seoDescription != null && r.seoDescription !== ""
        ? String(r.seoDescription)
        : undefined,
    categoryId: r.categoryId != null && r.categoryId !== "" ? String(r.categoryId) : null,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}
