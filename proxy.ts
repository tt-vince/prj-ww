import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, SESSION_COOKIE_NAME } from '@/lib/session';

/**
 * Optimistic auth gate for the dashboard. Only checks for a valid-looking
 * session cookie — no DB calls. Authoritative checks (status/role) run in the
 * Data Access Layer (`lib/dal.ts`) inside the protected pages and actions.
 *
 * Next.js 16 renamed Middleware to Proxy; this file replaces `middleware.ts`.
 */
export async function proxy(request: NextRequest) {
  const session = await decrypt(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session?.userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
