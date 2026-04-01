import { cookies, headers } from "next/headers";
import { getTenantSlugFromToken } from "@/lib/jwt";
import { tenantSlugFromRequest } from "@/lib/tenant-slug-from-host";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** Forward active org to the API: Host subdomain, optional x-tenant-slug, then JWT tenantSlug cookie. */
async function landingRequestHeaders(): Promise<HeadersInit> {
  const out: Record<string, string> = {};
  try {
    const h = await headers();
    const forwardedHost = h.get("x-forwarded-host");
    const host = forwardedHost ?? h.get("host");
    const fromSubdomain = tenantSlugFromRequest(host, null);
    if (fromSubdomain) {
      out["X-Tenant-Slug"] = fromSubdomain;
      return out;
    }
    const fromMiddleware = h.get("x-tenant-slug");
    if (fromMiddleware) {
      out["X-Tenant-Slug"] = fromMiddleware.trim().toLowerCase();
      return out;
    }
    const token = (await cookies()).get("access_token")?.value;
    if (token) {
      const slug = getTenantSlugFromToken(token);
      if (slug) out["X-Tenant-Slug"] = slug;
    }
  } catch {
    /* outside Next request context */
  }
  return out;
}

export interface LandingCategory {
  _id: string;
  name: string;
  description?: string;
}

export interface LandingProduct {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  category?: { _id: string; name: string } | null;
}

export interface LandingConfig {
  siteName?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  theme?: string;
  heroEnabled?: boolean;
  categoriesEnabled?: boolean;
  statsEnabled?: boolean;
  aboutEnabled?: boolean;
  productsEnabled?: boolean;
  testimonialsEnabled?: boolean;
  blogsEnabled?: boolean;
  contactEnabled?: boolean;
}

/** Serialized published blog from public landing API */
export interface PublicBlogPost {
  _id: string;
  title: string;
  description: string;
  image?: string;
  author?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicBlogsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PublicBlogsResponse {
  data: PublicBlogPost[];
  pagination: PublicBlogsPagination;
}

export interface LandingData {
  products: LandingProduct[];
  categories: LandingCategory[];
  config: LandingConfig;
  blogs?: PublicBlogPost[];
}

const emptyPagination = (limit = 10): PublicBlogsPagination => ({
  total: 0,
  page: 1,
  limit,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

/** Tenant-scoped landing calls must not use the default fetch cache: the URL is identical for every org while headers differ, so cached empty/wrong-tenant responses would be reused. */
const landingFetchInit = async (): Promise<RequestInit> => ({
  headers: await landingRequestHeaders(),
  cache: "no-store",
});

export async function getLandingData(): Promise<LandingData> {
  try {
    const res = await fetch(`${API_URL}/landing`, await landingFetchInit());

    if (!res.ok) {
      return { products: [], categories: [], config: {}, blogs: [] };
    }

    const data = (await res.json()) as LandingData;
    return { ...data, blogs: Array.isArray(data.blogs) ? data.blogs : [] };
  } catch {
    return { products: [], categories: [], config: {}, blogs: [] };
  }
}

export async function getPublicBlogs(
  page = 1,
  limit = 10,
): Promise<PublicBlogsResponse> {
  try {
    const res = await fetch(
      `${API_URL}/landing/blogs?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`,
      await landingFetchInit(),
    );
    if (!res.ok) {
      return { data: [], pagination: emptyPagination(limit) };
    }
    const json = (await res.json()) as Partial<PublicBlogsResponse>;
    const data = Array.isArray(json.data) ? json.data : [];
    const pagination = json.pagination ?? emptyPagination(limit);
    return { data, pagination };
  } catch {
    return { data: [], pagination: emptyPagination(limit) };
  }
}

export async function getPublicBlogById(id: string): Promise<PublicBlogPost | null> {
  try {
    const res = await fetch(
      `${API_URL}/landing/blogs/${encodeURIComponent(id)}`,
      await landingFetchInit(),
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json() as Promise<PublicBlogPost>;
  } catch {
    return null;
  }
}
