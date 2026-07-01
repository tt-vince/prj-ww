'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUser } from '@/lib/dal';
import { db } from '@/db';
import { guests, guestLabels, labels } from '@/db/schema';
import {
  guestInputSchema,
  guestIdSchema,
  labelInputSchema,
  labelIdSchema,
} from '@/lib/validation';
import { generateToken } from '@/lib/guest-token';

/** Result of a form Server Action, consumed via `useActionState` on the client. */
export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const OK: ActionState = { ok: true };

/** First message per field, shaped for inline display in the form. */
function toFieldErrors(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors };
}

function parseGuest(formData: FormData) {
  return guestInputSchema.safeParse({
    name: formData.get('name'),
    maxGuests: formData.get('maxGuests'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    adminNote: formData.get('adminNote'),
    status: formData.get('status') ?? undefined,
    labelIds: formData.getAll('labelIds'),
  });
}

/** Generate an invite token not already used (retry on the rare collision). */
async function uniqueToken(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const token = generateToken();
    const clash = await db
      .select({ id: guests.id })
      .from(guests)
      .where(eq(guests.token, token));
    if (clash.length === 0) return token;
  }
  throw new Error('Could not generate a unique invite token. Try again.');
}

export async function createGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = parseGuest(formData);
  if (!parsed.success) return toFieldErrors(parsed.error);
  const input = parsed.data;

  const token = await uniqueToken();
  const [row] = await db
    .insert(guests)
    .values({
      token,
      name: input.name,
      maxGuests: input.maxGuests,
      email: input.email,
      phone: input.phone,
      adminNote: input.adminNote,
      status: input.status,
    })
    .returning({ id: guests.id });

  // neon-http has no interactive transactions — sequential writes.
  if (input.labelIds.length) {
    await db
      .insert(guestLabels)
      .values(input.labelIds.map((labelId) => ({ guestId: row.id, labelId })));
  }

  revalidatePath('/dashboard');
  return OK;
}

export async function updateGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = guestIdSchema.safeParse(formData.get('guestId'));
  if (!id.success) return { ok: false, error: 'Invalid guest.' };
  const parsed = parseGuest(formData);
  if (!parsed.success) return toFieldErrors(parsed.error);
  const input = parsed.data;

  await db
    .update(guests)
    .set({
      name: input.name,
      maxGuests: input.maxGuests,
      email: input.email,
      phone: input.phone,
      adminNote: input.adminNote,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(guests.id, id.data));

  // Replace the tag set.
  await db.delete(guestLabels).where(eq(guestLabels.guestId, id.data));
  if (input.labelIds.length) {
    await db
      .insert(guestLabels)
      .values(input.labelIds.map((labelId) => ({ guestId: id.data, labelId })));
  }

  revalidatePath('/dashboard');
  return OK;
}

export async function deleteGuest(formData: FormData): Promise<void> {
  await requireUser();
  const guestId = guestIdSchema.parse(formData.get('guestId'));
  await db.delete(guests).where(eq(guests.id, guestId)); // cascade clears guest_labels
  revalidatePath('/dashboard');
}

export async function createLabel(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = labelInputSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return toFieldErrors(parsed.error);
  try {
    await db.insert(labels).values({ name: parsed.data.name });
  } catch {
    return { ok: false, fieldErrors: { name: 'That label already exists.' } };
  }
  revalidatePath('/dashboard');
  return OK;
}

export async function renameLabel(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = labelIdSchema.safeParse(formData.get('labelId'));
  if (!id.success) return { ok: false, error: 'Invalid label.' };
  const parsed = labelInputSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return toFieldErrors(parsed.error);
  try {
    await db.update(labels).set({ name: parsed.data.name }).where(eq(labels.id, id.data));
  } catch {
    return { ok: false, fieldErrors: { name: 'That label already exists.' } };
  }
  revalidatePath('/dashboard');
  return OK;
}

export async function deleteLabel(formData: FormData): Promise<void> {
  await requireUser();
  const labelId = labelIdSchema.parse(formData.get('labelId'));
  await db.delete(labels).where(eq(labels.id, labelId)); // cascade clears guest_labels
  revalidatePath('/dashboard');
}
