const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

/**
 * Resolve tenant slug from `?tenant=` or subdomain (e.g. acme.localhost, acme.example.com).
 */
export function getTenantSlugFromBrowser(): string | null {
  if (typeof window === "undefined") return null;

  const fromQuery = new URLSearchParams(window.location.search).get("tenant");
  if (fromQuery?.trim()) {
    return fromQuery.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  }

  const host = window.location.hostname;
  const rootHostname = ROOT_DOMAIN.split(":")[0];

  if (host === "localhost" || host === rootHostname) {
    return null;
  }

  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    return sub || null;
  }

  if (rootHostname && host.endsWith(`.${rootHostname}`) && host !== rootHostname) {
    return host.slice(0, -(rootHostname.length + 1)) || null;
  }

  return null;
}
