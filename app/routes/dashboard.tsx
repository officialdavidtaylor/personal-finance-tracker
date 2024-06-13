import { authenticator } from '~/services/auth.server';
import { ChevronRight, Plus } from 'lucide-react';
import { cx } from 'cva';
import { PrismaClient } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link } from 'primitives/Link';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard • Finance Tracker' },
    {
      name: 'description',
      content: 'Overview of all data',
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  // --- we know that the user is authenticated after this

  const prisma = new PrismaClient();

  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const firstDayOfCurrentMonth = new Date(currentYear, currentMonth);
  const firstDayOfLastMonth = new Date(
    currentMonth !== 0 ? currentYear : currentYear - 1,
    currentMonth !== 0 ? currentMonth - 1 : 11
  );

  const moneySpentLastMonth = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      // make sure we're only including the negative values here
      amount: {
        lt: 0,
      },
      // only include transactions from the previous month
      postedAt: {
        gte: firstDayOfLastMonth.toISOString(),
        lte: firstDayOfCurrentMonth.toISOString(),
      },
    },
    _sum: { amount: true },
  });

  const incomeLastMonth = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      // make sure we're only including the negative values here
      amount: {
        gt: 0,
      },
      // only include transactions from the previous month
      postedAt: {
        gte: firstDayOfLastMonth.toISOString(),
        lte: firstDayOfCurrentMonth.toISOString(),
      },
    },
    _sum: { amount: true },
  });

  // fetch the most recent 10 transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { postedAt: 'desc' },
    select: {
      id: true,
      amount: true,
      postedAt: true,
      merchant: { select: { title: true } },
      account: { select: { title: true } },
    },
    // only fetch the top 10 records
    take: 10,
  });

  return {
    transactions,
    spend: moneySpentLastMonth._sum.amount,
    income: incomeLastMonth._sum.amount,
    summaryDateString: `${firstDayOfLastMonth.toLocaleString('default', {
      month: 'long',
    })} ${firstDayOfLastMonth.getFullYear()}`,
  };
};

const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    ...options,
  }).format(amount / 100);
};

export default function Index() {
  const { transactions, spend, income, summaryDateString } =
    useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 p-4">
        <h3 className="text-sm uppercase text-white opacity-80">
          {`Overview • ${summaryDateString ?? 'Last month'}`}
        </h3>
        <div className="grid auto-cols-fr grid-cols-2">
          <div className="flex flex-col items-end p-4">
            <p className="text-sm font-semibold uppercase text-black text-opacity-60">
              Money In
            </p>
            <p className="bg-transparent text-4xl font-semibold text-white [text-shadow:_0_4px_4px_rgb(0_0_0_/_5%)]">
              {income
                ? formatCurrency(income ?? 0, { maximumFractionDigits: 0 })
                : '-'}
            </p>
          </div>
          <div className="flex flex-col items-end p-4">
            <p className="text-sm font-semibold uppercase text-black text-opacity-60">
              Money Out
            </p>
            <p className="bg-transparent text-4xl font-semibold text-white [text-shadow:_0_4px_4px_rgb(0_0_0_/_5%)]">
              {spend
                ? formatCurrency(Math.abs(spend ?? 0), {
                    maximumFractionDigits: 0,
                  })
                : '-'}
            </p>
          </div>
        </div>
        <Link
          to={'/analytics'}
          variant={'secondaryButton'}
          className="flex self-end"
        >
          <span className="font-normal capitalize">View Analytics</span>
          <ChevronRight className="stroke-white" />
        </Link>
      </div>
      <Link
        variant="primaryButton"
        className="flex w-fit gap-2 self-center"
        to={'/bulk-add-transactions'}
      >
        <span>Add Transactions</span>
        <Plus />
      </Link>
      <div className="pb-4">
        <h1 className="pb-2 text-lg font-semibold">Recent Transactions</h1>
        {transactions.length > 0 ? (
          <table className="w-full table-auto rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="rounded-tl-lg bg-cyan-200 p-4 text-left text-sm uppercase text-black text-opacity-60">
                  Location
                </th>
                <th className="bg-cyan-200 p-4 text-right text-sm uppercase text-black text-opacity-60">
                  Amount
                </th>
                <th className="rounded-tr-lg bg-cyan-200" />
              </tr>
            </thead>
            <tbody className="table-row-group rounded-br-lg">
              {transactions.map((row) => (
                <tr key={row.id} className="odd:bg-white">
                  <td className="table-cell px-4 py-4">
                    <a href={`/transaction/${row.id}`}>
                      <p className="text-lg font-medium">
                        {row.merchant.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.account?.title}
                      </p>
                    </a>
                  </td>
                  <td
                    className={cx(
                      'table-cell whitespace-nowrap px-4 py-4 text-right text-lg font-medium',
                      row.amount > 0 ? 'text-green-600' : 'text-red-500'
                    )}
                  >
                    <a href={`/transaction/${row.id}`}>
                      {formatCurrency(row.amount)}
                    </a>
                  </td>
                  <td>
                    <a
                      href={`/transaction/${row.id}`}
                      className="flex h-full items-center justify-center pr-2"
                    >
                      <ChevronRight className="stroke-slate-700" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="">
              <tr className="">
                <th
                  scope="row"
                  colSpan={4}
                  className="rounded-b-lg bg-cyan-100"
                >
                  <a
                    href={'/transaction'}
                    className="flex items-center justify-center gap-2 py-4"
                  >
                    <span className="font-normal capitalize">
                      View All Transactions
                    </span>
                    <ChevronRight />
                  </a>
                </th>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p>{"Looks like you don't have any transactions just yet!"}</p>
        )}
      </div>
    </div>
  );
}
