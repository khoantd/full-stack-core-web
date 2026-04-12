import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export const config = {
  matcher: [
    '/',
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  ]
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tenantSlugFromRequest } from '@/lib/tenant-slug-from-host';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard'];

// Routes that are only for guests (redirect to /dashboard if already authed)
const GUEST_ONLY = ['/login', '/register'];

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  return tenantSlugFromRequest(host, request.url);
}

function mergeIntlHeaders(target: NextResponse, intlResponse: NextResponse) {
  intlResponse.headers.forEach((value, key) => {
    // Preserve multiple Set-Cookie headers, if any.
    if (key.toLowerCase() === 'set-cookie') {
      target.headers.append(key, value);
      return;
    }

    if (!target.headers.has(key)) {
      target.headers.set(key, value);
    }
  });
}

export function proxy(request: NextRequest) {
  // 1) Let next-intl handle locale redirects/rewrites first.
  // If it wants to redirect/rewrite, we must return immediately.
  const pathnameBeforeIntl = request.nextUrl.pathname;
  const intlResponse = intlMiddleware(request);
  const hasIntlRedirect = intlResponse.headers.has('location');
  const hasIntlRewrite = intlResponse.headers.has('x-middleware-rewrite');
  if (hasIntlRedirect || hasIntlRewrite) {
    return intlResponse;
  }

  // Otherwise it returned "next" and may include headers we should preserve.
  const locales = routing.locales as readonly string[];
  const segments = pathnameBeforeIntl.split('/').filter(Boolean);

  // 2) Filesystem routes do not include a `[locale]` segment. When a locale is
  // present in the URL (e.g. `/vi/...`), we must rewrite to the internal path
  // (e.g. `/...`) while keeping the locale for next-intl (cookie/header).
  //
  // next-intl middleware can also do this, but with the current routing setup
  // it may return "next" for already-prefixed URLs. This keeps locale routing
  // working without breaking translations.
  const hasAnyLocalePrefix = segments.length >= 1 && locales.includes(segments[0]);
  const hasDoubleLocalePrefix =
    segments.length >= 2 && locales.includes(segments[0]) && locales.includes(segments[1]);

  if (hasAnyLocalePrefix) {
    const locale = segments[0];
    let i = 0;
    while (i < segments.length && locales.includes(segments[i])) i++;
    const rest = segments.slice(i).join('/');
    const internalPath = rest ? `/${rest}` : '/';

    // Forward locale as a REQUEST header so next-intl's requestLocale receives it.
    // Using NextResponse.rewrite(url, { request: { headers } }) is the only reliable
    // way — setting x-middleware-request-* on the response object alone does not
    // guarantee the header reaches the server component in Next.js 16.
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('x-next-intl-locale', locale);

    const res = NextResponse.rewrite(new URL(internalPath, request.url), {
      request: { headers: reqHeaders },
    });
    // Preserve any extra next-intl response headers/cookies.
    mergeIntlHeaders(res, intlResponse);
    res.cookies.set('NEXT_LOCALE', locale);
    return res;
  }

  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  if (subdomain) {
    if (pathname.startsWith('/admin')) {
      const res = NextResponse.redirect(new URL('/dashboard', request.url));
      mergeIntlHeaders(res, intlResponse);
      return res;
    }

    if (pathname === '/') {
      const res = NextResponse.rewrite(new URL(`/dashboard`, request.url));
      mergeIntlHeaders(res, intlResponse);
      return res;
    }

    const response = NextResponse.next();
    response.headers.set('x-tenant-slug', subdomain);
    mergeIntlHeaders(response, intlResponse);
    return response;
  }

  const token =
    request.cookies.get('access_token')?.value ??
    request.headers.get('x-access-token');

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    mergeIntlHeaders(res, intlResponse);
    return res;
  }

  if (isGuestOnly && token) {
    const res = NextResponse.redirect(new URL('/dashboard', request.url));
    mergeIntlHeaders(res, intlResponse);
    return res;
  }

  const res = NextResponse.next();
  mergeIntlHeaders(res, intlResponse);
  return res;
}

export default function middleware(request: NextRequest) {
  return proxy(request);
}
