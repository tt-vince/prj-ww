import { z } from 'zod';

/** Input schemas / DTOs for Server Actions — the single source of type truth. */

export const userIdSchema = z.string().uuid();
export const guestIdSchema = z.string().uuid();
export const labelIdSchema = z.string().uuid();

/** Mirrors the `rsvp_status` pg enum in db/schema.ts. */
export const rsvpStatusValues = ['pending', 'going', 'not_going'] as const;

/** Treat blank form fields as absent so optional() applies. */
const blankToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

/** Admin create/edit input for a guest (party/household). */
export const guestInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  maxGuests: z.preprocess(
    (v) => (v === '' || v == null ? 1 : v),
    z.coerce.number().int().min(1).max(20),
  ),
  email: z.preprocess(blankToUndefined, z.email('Enter a valid email').max(200).optional()),
  phone: z.preprocess(blankToUndefined, z.string().trim().max(30).optional()),
  adminNote: z.preprocess(blankToUndefined, z.string().trim().max(1000).optional()),
  status: z.enum(rsvpStatusValues).default('pending'),
  labelIds: z.array(z.string().uuid()).default([]),
});
export type GuestInput = z.infer<typeof guestInputSchema>;

/**
 * Guest RSVP reply (submitted from the public `?id=<token>` form).
 * The guest only ever sets `going` or `not_going` — never `pending`.
 * `adults`/`kids` are the head-count; their total is bound to the invitee's
 * seat allotment server-side and both are zeroed when the reply is `not_going`.
 */
export const rsvpResponseSchema = z.object({
  token: z.string().trim().min(1),
  status: z.enum(['going', 'not_going']),
  adults: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.coerce.number().int().min(1).max(20).optional(),
  ),
  kids: z.preprocess(
    (v) => (v === '' || v == null ? 0 : v),
    z.coerce.number().int().min(0).max(20),
  ),
  guestNote: z.preprocess(blankToUndefined, z.string().trim().max(1000).optional()),
});
export type RsvpResponse = z.infer<typeof rsvpResponseSchema>;

/** Add/rename a label (tag). */
export const labelInputSchema = z.object({
  name: z.string().trim().min(1, 'Label name is required').max(40),
});
export type LabelInput = z.infer<typeof labelInputSchema>;
