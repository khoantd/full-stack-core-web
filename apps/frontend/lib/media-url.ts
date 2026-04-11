function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

/**
 * Ensures a media URL is absolute for Next/Image and clipboard.
 * When NEXT_PUBLIC_MEDIA_BASE_URL is the CMS host (e.g. https://cms.brainspark.app), absolute
 * links that still point at NEXT_PUBLIC_API_URL for `/media/public/...` are rewritten to the CMS
 * origin so images load through the Next.js proxy (see next.config rewrites).
 */
export function buildMediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;

  const cmsBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
    ? trimTrailingSlashes(process.env.NEXT_PUBLIC_MEDIA_BASE_URL)
    : "";
  const apiBase = process.env.NEXT_PUBLIC_API_URL
    ? trimTrailingSlashes(process.env.NEXT_PUBLIC_API_URL)
    : "";

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    if (
      cmsBase &&
      apiBase &&
      cmsBase !== apiBase &&
      pathOrUrl.startsWith(`${apiBase}/media/public/`)
    ) {
      return `${cmsBase}${pathOrUrl.slice(apiBase.length)}`;
    }
    return pathOrUrl;
  }

  if (!cmsBase) {
    return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  }
  const p = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${cmsBase}${p}`;
}
