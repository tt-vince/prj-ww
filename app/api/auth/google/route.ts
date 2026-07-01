import { NextResponse } from 'next/server';
import { buildAuthUrl, pkceChallenge, randomToken } from '@/lib/oauth';

// Short-lived cookies that carry the OAuth transaction across the Google redirect.
const TXN_MAX_AGE = 60 * 10; // 10 minutes

/** Initiate Google OAuth: generate state + nonce + PKCE, then redirect to Google. */
export async function GET() {
  const state = randomToken();
  const nonce = randomToken();
  const codeVerifier = randomToken(32);
  const codeChallenge = await pkceChallenge(codeVerifier);

  const res = NextResponse.redirect(buildAuthUrl({ state, nonce, codeChallenge }));
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TXN_MAX_AGE,
  };
  res.cookies.set('oauth_state', state, opts);
  res.cookies.set('oauth_nonce', nonce, opts);
  res.cookies.set('oauth_verifier', codeVerifier, opts);
  return res;
}
