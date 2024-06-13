import { ActionFunctionArgs, json } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { bulkCreateTransactionRecordSchema } from 'prisma/validators';
import { PrismaClient, Transaction } from '@prisma/client';
import type { BulkCreateTransactionRecord } from 'prisma/validators';

let prisma: PrismaClient;

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json({}, { status: 403 });
  }

  const body = await request.json();

  const { success, data } = bulkCreateTransactionRecordSchema.safeParse(body);

  if (!success)
    return json({}, { status: 400, statusText: 'Malformed payload' });

  // add the userId to all records
  const bulkTransactionData = [] as Omit<Transaction, 'id' | 'createdAt'>[];
  for (const record of data) {
    bulkTransactionData.push({ ...record, userId: user.id });
  }

  prisma ??= new PrismaClient();

  const transactionCount = await prisma.transaction.createMany({
    data: bulkTransactionData,
  });

  return json(transactionCount);
};

/** A function to call from the client to hit this endpoint; */
export const bulkCreateTransactions = async (
  transactions: BulkCreateTransactionRecord
) => {
  const response = await fetch('/api/bulkCreateTransactions', {
    method: 'POST',
    body: JSON.stringify(transactions),
  });
  if (!response.ok) {
    return {
      data: undefined,
      error: { status: response.status, statusText: response.statusText },
    };
  }
  const newTransactionCount = await response.json();
  return { data: newTransactionCount as { count: number }, error: undefined };
};
