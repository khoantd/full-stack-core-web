import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tenantSlugFromRequest } from '@/lib/tenant-slug-from-host';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard'];

// Routes that are only for guests (redirect to /dashboard if already authed)
const GUEST_ONLY = ['/login', '/register'];

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  return tenantSlugFromRequest(host, request.url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  if (subdomain) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/dashboard`, request.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-tenant-slug', subdomain);
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
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
