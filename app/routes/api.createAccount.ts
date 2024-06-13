import { ActionFunctionArgs, json } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { createAccountRecordSchema } from 'prisma/validators';
import { Account, PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json({}, { status: 403 });
  }

  const formData = await request.formData();

  const userInput: Record<string, FormDataEntryValue | null> = {};
  // extract all of the fields required for the schema from the request formData
  for (const field in createAccountRecordSchema.shape) {
    userInput[field] = formData.get(field);
  }

  const { success, data } = createAccountRecordSchema.safeParse({
    ...userInput,
    // manually add the userId; this comes from the authenticator, not the user's form data
    userId: user.id,
  });

  if (success) {
    prisma ??= new PrismaClient();

    const newAccountRecord = await prisma.account.create({ data });

    return json(newAccountRecord);
  }

  return json({}, { status: 400, statusText: 'Missing form data' });
};

/** A function to call from the client to hit this endpoint; */
export const createAccount = async (formData: FormData) => {
  const response = await fetch('/api/createAccount', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    return {
      data: undefined,
      error: { status: response.status, statusText: response.statusText },
    };
  }
  const newAccount = await response.json();
  return { data: newAccount as Account, error: undefined };
};
