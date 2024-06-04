import { z } from 'zod';

export const loginFormFieldsSchema = z.object({
  email: z.string().email({ message: 'Must be a valid email address' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormFields = z.infer<typeof loginFormFieldsSchema>;

// This schema must be kept in-sync with the prisma schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  createdAt: z.date(),
  authId: z.string(),
  authSource: z.string(),
});

export type User = z.infer<typeof userSchema>;
