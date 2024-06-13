import { z } from 'zod';

export const accountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  type: z.string().nullable(),
  accentColor: z.string().nullable(),
  dateFirstAvailable: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

/**
 * When creating a new account record, both `createdAt` and `id` are generated
 * by the DB at the time of insertion.
 */
export const createAccountRecordSchema = accountSchema.omit({
  id: true,
  createdAt: true,
});

export const merchantSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const createMerchantRecordSchema = merchantSchema.omit({
  id: true,
  createdAt: true,
});

export const transactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  accountId: z.string().uuid().nullable(),
  merchantId: z.string().uuid(),
  amount: z.number(),
  description: z.string().nullable(),
  postedAt: z.coerce.date(),
  transactedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

export const createTransactionRecordSchema = transactionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const bulkCreateTransactionRecordSchema =
  createTransactionRecordSchema.array();

export type BulkCreateTransactionRecord = z.infer<
  typeof bulkCreateTransactionRecordSchema
>;
