'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireSuperadmin } from '@/lib/dal';
import { db } from '@/db';
import { users } from '@/db/schema';
import { userIdSchema } from '@/lib/validation';

/** Resolve the target user id, enforcing superadmin + no self-modification. */
async function authorizeTarget(formData: FormData) {
  const admin = await requireSuperadmin();
  const targetId = userIdSchema.parse(formData.get('userId'));
  if (targetId === admin.id) throw new Error('You cannot modify your own account.');
  return targetId;
}

export async function activateUser(formData: FormData) {
  const targetId = await authorizeTarget(formData);
  await db.update(users).set({ status: 'active' }).where(eq(users.id, targetId));
  revalidatePath('/dashboard/users');
}

export async function deactivateUser(formData: FormData) {
  const targetId = await authorizeTarget(formData);
  const [target] = await db.select().from(users).where(eq(users.id, targetId));
  // Belt-and-suspenders: never disable the (only) superadmin.
  if (target?.role === 'superadmin') throw new Error('Cannot deactivate a superadmin.');
  await db.update(users).set({ status: 'disabled' }).where(eq(users.id, targetId));
  revalidatePath('/dashboard/users');
}
