import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { exchangeCode, verifyIdToken } from '@/lib/oauth';
import { updateUserOnLogin } from '@/lib/users';
import { encrypt, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/session';

const OAUTH_COOKIES = ['oauth_state', 'oauth_nonce', 'oauth_verifier'];

function clearTxnCookies(res: NextResponse) {
  for (const name of OAUTH_COOKIES) res.cookies.set(name, '', { path: '/', maxAge: 0 });
}

/** Google OAuth callback: verify state/PKCE/id_token, authenticate the existing
 *  user, gate on status, and issue the session cookie for active users. No
 *  self-sign-up — an unknown Google account is denied, no user is created. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const appUrl = process.env.APP_URL ?? url.origin;
  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, appUrl));
    clearTxnCookies(res);
    return res;
  };

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (url.searchParams.get('error') || !code || !state) return redirectTo('/login?error=oauth');

  const cookieState = request.cookies.get('oauth_state')?.value;
  const nonce = request.cookies.get('oauth_nonce')?.value;
  const verifier = request.cookies.get('oauth_verifier')?.value;
  if (!cookieState || !nonce || !verifier || cookieState !== state) {
    return redirectTo('/login?error=state');
  }

  try {
    const idToken = await exchangeCode(code, verifier);
    const profile = await verifyIdToken(idToken, nonce);
    if (!profile.emailVerified) return redirectTo('/login?error=unverified');

    const user = await updateUserOnLogin(profile);
    if (!user) return redirectTo('/login?error=denied');
    // Profile fields (name/picture/lastLoginAt) changed — refresh cached user
    // data in the background ('max' = serve stale while revalidating).
    revalidateTag(`user:${user.id}`, 'max');
    revalidateTag('users', 'max');
    if (user.status !== 'active') return redirectTo('/login?pending=1');

    const token = await encrypt({ userId: user.id });
    const res = NextResponse.redirect(new URL('/dashboard', appUrl));
    clearTxnCookies(res);
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch {
    return redirectTo('/login?error=auth');
  }
}
