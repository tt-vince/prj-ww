import { randomInt } from 'node:crypto';

// URL-safe, unambiguous alphabet (no 0/O/1/I/L) — Crockford base32-ish.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const TOKEN_LENGTH = 8;

/**
 * A short, unguessable, URL-safe invite token (e.g. `A7FK9QM2`), used as the
 * per-guest id in the wedding-site link (`?id=<token>`). Uses the crypto RNG —
 * never Math.random. Callers must ensure uniqueness against `guests.token`
 * (the column has a unique index; retry on the rare collision).
 */
export function generateToken(length: number = TOKEN_LENGTH): string {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(0, ALPHABET.length)];
  return out;
}
