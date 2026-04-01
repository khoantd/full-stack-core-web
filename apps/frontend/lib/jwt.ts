/**
 * Decode a JWT without verifying the signature (client-side only).
 * Returns the payload object or null if invalid.
 */
export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

export function getTenantIdFromToken(token: string): string | null {
  const decoded = decodeJwt(token);
  // NestJS wraps payload in { payload: { ... } }
  return decoded?.payload?.tenantId ?? decoded?.tenantId ?? null;
}

/** Organization slug from access token (for public landing X-Tenant-Slug). */
export function getTenantSlugFromToken(token: string): string | null {
  const decoded = decodeJwt(token);
  const slug = decoded?.payload?.tenantSlug ?? decoded?.tenantSlug;
  return typeof slug === "string" && slug.trim() ? slug.trim().toLowerCase() : null;
}

export function getUserFromToken(token: string) {
  const decoded = decodeJwt(token);
  return decoded?.payload ?? null;
}
