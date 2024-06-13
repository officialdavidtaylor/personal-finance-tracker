import { Merchant, PrismaClient } from '@prisma/client';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

let prisma: PrismaClient;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json({}, { status: 401 });
  }

  prisma ??= new PrismaClient();

  const merchants = await prisma.merchant.findMany();

  return json(merchants);
};

/** A function to call from the client to hit this endpoint; */
export const getMerchants = async () => {
  const response = await fetch('/api/getMerchants');
  if (!response.ok) {
    return {
      data: undefined,
      error: { status: response.status, statusText: response.statusText },
    };
  }
  const merchants = await response.json();
  return { data: merchants as Merchant[], error: undefined };
};
