// Edge-runtime middleware. RBAC routing guard.
// Note: we read the JWT directly here (not via `auth()`) to avoid importing
// Prisma into the Edge bundle.
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication (denylist — everything else is public so
// 404s fall through to Next's not-found handler instead of redirecting to login).
const PROTECTED_PREFIXES = ['/admin', '/dashboard', '/my', '/change-password'];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals, static files, and all API endpoints (they enforce
  // their own auth via requireRole/requireAuth and return JSON 401, not a redirect).
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/.well-known') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public — let through (404s included; Next handles them)
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Force password change before anything else (allow access TO /change-password)
  if (token.forcePasswordChange && pathname !== '/change-password') {
    const url = req.nextUrl.clone();
    url.pathname = '/change-password';
    return NextResponse.redirect(url);
  }

  // /admin/* — ADMIN only
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/403';
    return NextResponse.redirect(url);
  }

  // /dashboard/* — MANAGER or ADMIN
  if (pathname.startsWith('/dashboard') && token.role !== 'MANAGER' && token.role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/403';
    return NextResponse.redirect(url);
  }

  // /my/* — any authenticated user (already covered above)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next internals, static files, and the auth API
    '/((?!_next/static|_next/image|favicon.ico|api/auth|uploads|.*\\.[a-z0-9]+$).*)',
  ],
};
