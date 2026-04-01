import { getTenantSlugFromToken } from "@/lib/jwt";

const COOKIE_ACCESS_MAX = 900;
const COOKIE_REFRESH_MAX = 604800;

/** Sets access/refresh cookies and `tenant_slug` for server-rendered landing. */
export function syncAuthSessionCookies(accessToken: string, refreshToken?: string | null): void {
  if (typeof document === "undefined") return;
  document.cookie = `access_token=${accessToken}; path=/; max-age=${COOKIE_ACCESS_MAX}; SameSite=Lax`;
  if (refreshToken) {
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${COOKIE_REFRESH_MAX}; SameSite=Lax`;
  }
  const slug = getTenantSlugFromToken(accessToken);
  if (slug) {
    document.cookie = `tenant_slug=${encodeURIComponent(slug)}; path=/; max-age=${COOKIE_REFRESH_MAX}; SameSite=Lax`;
  }
}

export function clearAuthSessionCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "access_token=; path=/; max-age=0";
  document.cookie = "refresh_token=; path=/; max-age=0";
  document.cookie = "tenant_slug=; path=/; max-age=0";
}
