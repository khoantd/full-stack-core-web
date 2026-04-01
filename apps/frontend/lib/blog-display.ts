import type { PublicBlogPost } from "@/services/landing.service";

export function formatBlogDate(post: PublicBlogPost): string {
  const raw = post.publishedAt ?? post.createdAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function blogAuthor(post: PublicBlogPost): string {
  return post.author?.trim() || "Editor";
}
