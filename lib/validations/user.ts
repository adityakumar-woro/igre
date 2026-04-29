import { z } from 'zod';

export const userCreateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).max(20).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  bio: z.string().max(800).optional(),
});

export const userUpdateSchema = userCreateSchema.partial().extend({
  avatarUrl: z.string().url().optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
