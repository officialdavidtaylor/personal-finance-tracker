import { ActionFunctionArgs, json } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { createMerchantRecordSchema } from 'prisma/validators';
import { Merchant, PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json({}, { status: 403 });
  }

  const formData = await request.formData();

  const userInput: Record<string, FormDataEntryValue | null> = {};
  // extract all of the fields required for the schema from the request formData
  for (const field in createMerchantRecordSchema.shape) {
    userInput[field] = formData.get(field);
  }

  const { success, data } = createMerchantRecordSchema.safeParse({
    ...userInput,
    // manually add the userId; this comes from the authenticator, not the user's form data
  });

  if (success) {
    prisma ??= new PrismaClient();

    const newMerchantRecord = await prisma.merchant.create({ data });

    return json(newMerchantRecord);
  }

  return json({}, { status: 400, statusText: 'Missing form data' });
};

/** A function to call from the client to hit this endpoint; */
export const createMerchant = async (formData: FormData) => {
  const response = await fetch('/api/createMerchant', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    return {
      data: undefined,
      error: { status: response.status, statusText: response.statusText },
    };
  }
  const newMerchant = await response.json();
  return { data: newMerchant as Merchant, error: undefined };
};
