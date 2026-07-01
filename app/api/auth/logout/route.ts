import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

/** Clear the session cookie and return to /login. POST-only to avoid prefetch/CSRF-triggered logout. */
export async function POST(request: NextRequest) {
  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;
  const res = NextResponse.redirect(new URL('/login', appUrl), 303);
  res.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
