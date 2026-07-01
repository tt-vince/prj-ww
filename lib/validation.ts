import { z } from 'zod';

/** Input schemas / DTOs for Server Actions. */

export const userIdSchema = z.string().uuid();
