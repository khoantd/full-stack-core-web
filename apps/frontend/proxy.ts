import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard'];

// Routes that are only for guests (redirect to /dashboard if already authed)
const GUEST_ONLY = ['/login', '/register'];

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const match = url.match(/http:\/\/([^.]+)\.localhost/);
    if (match?.[1]) return match[1];
    if (hostname.includes('.localhost')) return hostname.split('.')[0];
    return null;
  }

  const rootHostname = ROOT_DOMAIN.split(':')[0];

  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  const isSubdomain =
    hostname !== rootHostname &&
    hostname !== `www.${rootHostname}` &&
    hostname.endsWith(`.${rootHostname}`);

  return isSubdomain ? hostname.replace(`.${rootHostname}`, '') : null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  if (subdomain) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
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
