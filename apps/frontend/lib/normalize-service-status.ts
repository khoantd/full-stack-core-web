import type { Service, ServiceContentBlock, ServiceStatus } from "@/types/service.type";

/**
 * Maps API / DB status strings to the canonical values expected by forms and Select items.
 */
export function normalizeServiceStatus(value: unknown): ServiceStatus {
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

export function mapApiService(raw: unknown): Service {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const contentRaw = Array.isArray(r.content) ? (r.content as unknown[]) : undefined;
  const categoryIdsRaw = Array.isArray(r.categoryIds) ? (r.categoryIds as unknown[]) : undefined;
  const categoryIds = categoryIdsRaw
    ?.map((x) => (typeof x === "string" ? x : x && typeof x === "object" ? String((x as any)._id ?? "") : ""))
    .map((x) => x.trim())
    .filter(Boolean);

  const content: ServiceContentBlock[] | undefined = contentRaw
    ?.map((b): ServiceContentBlock | null => {
      if (!b || typeof b !== "object") return null;
      const o = b as Record<string, unknown>;
      const type = typeof o.type === "string" ? o.type : "";
      if (type === "heading") {
        const text = typeof o.text === "string" ? o.text : "";
        const level = typeof o.level === "number" ? o.level : undefined;
        if (!text) return null;
        if (level != null && ![1, 2, 3, 4].includes(level)) return null;
        return { type: "heading", text, ...(level ? { level: level as 1 | 2 | 3 | 4 } : {}) };
      }
      if (type === "paragraph") {
        const text = typeof o.text === "string" ? o.text : "";
        if (!text) return null;
        return { type: "paragraph", text };
      }
      if (type === "bullets") {
        const items = Array.isArray(o.items) ? o.items.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
        if (items.length === 0) return null;
        return { type: "bullets", items };
      }
      if (type === "image") {
        const url = typeof o.url === "string" ? o.url : "";
        const alt = typeof o.alt === "string" && o.alt.trim() !== "" ? o.alt : undefined;
        if (!url) return null;
        return { type: "image", url, ...(alt ? { alt } : {}) };
      }
      return null;
    })
    .filter((x): x is ServiceContentBlock => x != null);
  return {
    _id: String(r._id ?? ""),
    title: String(r.title ?? ""),
    description: String(r.description ?? ""),
    image: r.image != null && r.image !== "" ? String(r.image) : undefined,
    status: normalizeServiceStatus(r.status),
    price: typeof r.price === "number" ? r.price : r.price != null && r.price !== "" ? Number(r.price) : undefined,
    duration: r.duration != null && r.duration !== "" ? String(r.duration) : undefined,
    category: r.category != null && r.category !== "" ? String(r.category) : undefined,
    categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
    seoTitle: r.seoTitle != null && r.seoTitle !== "" ? String(r.seoTitle) : undefined,
    seoDescription:
      r.seoDescription != null && r.seoDescription !== ""
        ? String(r.seoDescription)
        : undefined,
    content: content && content.length > 0 ? content : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

