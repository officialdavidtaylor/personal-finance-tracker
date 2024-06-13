import { Account, PrismaClient } from '@prisma/client';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

let prisma: PrismaClient;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json({}, { status: 401 });
  }

  prisma ??= new PrismaClient();

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
  });

  return json(accounts);
};

/** A function to call from the client to hit this endpoint; */
export const getAccounts = async () => {
  const response = await fetch('/api/getAccounts');
  if (!response.ok) {
    return {
      data: undefined,
      error: { status: response.status, statusText: response.statusText },
    };
  }
  const accounts = await response.json();
  return { data: accounts as Account[], error: undefined };
};
