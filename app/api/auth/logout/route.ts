import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

/** OAuth transaction cookies that may linger after an abandoned sign-in. */
const OAUTH_COOKIES = ['oauth_state', 'oauth_nonce', 'oauth_verifier'];

/** Clear the session (and any leftover OAuth txn cookies) and return to /login.
 *  POST-only to avoid prefetch/CSRF-triggered logout. */
export async function POST(request: NextRequest) {
  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;
  const res = NextResponse.redirect(new URL('/login', appUrl), 303);
  for (const name of [SESSION_COOKIE_NAME, ...OAUTH_COOKIES]) {
    res.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return res;
}
