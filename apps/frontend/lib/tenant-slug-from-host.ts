const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

/**
 * Resolves tenant slug from Host header and optional request URL (same rules as middleware / proxy).
 */
export function tenantSlugFromRequest(
  hostHeader: string | null | undefined,
  requestUrl?: string | null,
): string | null {
  const host = (hostHeader ?? "").trim();
  const hostname = host.split(":")[0];
  if (!hostname) return null;

  const localEnv =
    hostname.endsWith(".localhost") ||
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    (requestUrl != null &&
      (requestUrl.includes("localhost") || requestUrl.includes("127.0.0.1")));

  if (localEnv) {
    if (requestUrl) {
      const match = requestUrl.match(/https?:\/\/([^.]+)\.localhost/);
      if (match?.[1]) return match[1].toLowerCase();
    }
    if (hostname.includes(".localhost")) {
      const sub = hostname.split(".")[0];
      if (sub && sub !== "www") return sub.toLowerCase();
    }
    return null;
  }

  const rootHostname = ROOT_DOMAIN.split(":")[0];

  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    const first = parts[0];
    return first ? first.toLowerCase() : null;
  }

  const isSubdomain =
    hostname !== rootHostname &&
    hostname !== `www.${rootHostname}` &&
    hostname.endsWith(`.${rootHostname}`);

  return isSubdomain ? hostname.replace(`.${rootHostname}`, "").toLowerCase() : null;
}
