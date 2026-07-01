import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['superadmin', 'admin']);
export const userStatus = pgEnum('user_status', ['pending', 'active', 'disabled']);
export const rsvpStatus = pgEnum('rsvp_status', ['attending', 'not_attending', 'maybe']);

/**
 * Authenticated admin users (Google-identified). Rows are provisioned
 * out-of-band (directly in the DB) — there is no self-sign-up; Google sign-in
 * only authenticates a user that already exists here (matched by `google_sub`)
 * and refreshes their profile. The partial unique index guarantees at most one
 * `superadmin` can ever exist.
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    googleSub: text('google_sub').notNull().unique(), // Google `sub` claim — stable identity
    email: text('email').notNull().unique(),
    name: text('name'),
    picture: text('picture'),
    role: userRole('role').notNull().default('admin'),
    status: userStatus('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('one_superadmin_idx')
      .on(table.role)
      .where(sql`${table.role} = 'superadmin'`),
  ],
);

export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  status: rsvpStatus('status').notNull(),
  guestCount: integer('guest_count').notNull().default(1),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Rsvp = typeof rsvps.$inferSelect;
export type NewRsvp = typeof rsvps.$inferInsert;
