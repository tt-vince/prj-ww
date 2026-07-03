import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import type { SnsAccounts } from '@/lib/sns';

export const userRole = pgEnum('user_role', ['superadmin', 'admin', 'viewer']);
export const userStatus = pgEnum('user_status', ['pending', 'active', 'disabled']);

/** RSVP reply state. Fixed set (not runtime-editable). `pending` = awaiting reply. */
export const rsvpStatus = pgEnum('rsvp_status', ['pending', 'going', 'not_going']);

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

/**
 * Editable tags the couple manages (e.g. "Bride's family", "College friends").
 * Attached to guests many-to-many via `guestLabels`.
 */
export const labels = pgTable('labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Invitees ("people"). Admin-managed: the couple adds a party/household with a
 * `token` used in the wedding-site link (`?id=<token>`) and a `maxGuests`
 * allotment. The `status`/`adults`/`kids`/`guestNote`/`respondedAt` columns hold the
 * guest's response — nullable/default and NOT written yet (guest form deferred).
 */
export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(), // short URL-safe token → ?id=<token>
  name: text('name').notNull(), // party / household name
  maxGuests: integer('max_guests').notNull().default(1), // seat allotment (1–20)

  // admin-only
  email: text('email'),
  phone: text('phone'),
  adminNote: text('admin_note'),
  snsAccounts: jsonb('sns_accounts').$type<SnsAccounts>().notNull().default({}), // social handles keyed by platform

  // guest response — filled later by the (deferred) guest form
  status: rsvpStatus('status').notNull().default('pending'),
  adults: integer('adults'), // # adults attending
  kids: integer('kids'), // # kids attending — total (adults + kids) ≤ maxGuests
  guestNote: text('guest_note'),
  respondedAt: timestamp('responded_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/** guest ↔ label join (many-to-many). Cascades so deleting either side is clean. */
export const guestLabels = pgTable(
  'guest_labels',
  {
    guestId: uuid('guest_id')
      .notNull()
      .references(() => guests.id, { onDelete: 'cascade' }),
    labelId: uuid('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.guestId, table.labelId] })],
);

export const guestsRelations = relations(guests, ({ many }) => ({
  guestLabels: many(guestLabels),
}));
export const labelsRelations = relations(labels, ({ many }) => ({
  guestLabels: many(guestLabels),
}));
export const guestLabelsRelations = relations(guestLabels, ({ one }) => ({
  guest: one(guests, { fields: [guestLabels.guestId], references: [guests.id] }),
  label: one(labels, { fields: [guestLabels.labelId], references: [labels.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type GuestLabel = typeof guestLabels.$inferSelect;
