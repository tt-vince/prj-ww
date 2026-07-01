import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type Database = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return drizzle(neon(url), { schema });
}

const globalForDb = globalThis as unknown as { __db?: Database };

/**
 * Lazy Drizzle client. The connection is created on first use, not on import,
 * so `next build` (which imports route modules to collect page data) never
 * fails when DATABASE_URL is absent at build time. The env var is still
 * required at runtime for any query. One client is reused across hot reloads.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = (globalForDb.__db ??= createDb());
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
