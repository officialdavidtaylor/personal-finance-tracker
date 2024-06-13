import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const seedData = [];

  for (let i = 0; i < 10; i += 1) {
    seedData.push({
      id: faker.string.uuid(),
      // assign a known auth uuid to the first generated user
      authId:
        i === 0 && process.env.SUPABASE_DEMO_USER_SSID?.length
          ? process.env.SUPABASE_DEMO_USER_SSID
          : faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      accounts: [] as { id: string; title: string }[],
      categories: [] as { id: string; title: string }[],
      merchants: [] as { id: string; title: string }[],
      transactions: [] as {
        amount: number;
        postedAt: Date;
        transactedAt: Date | null;
        accountId: string;
        merchantId: string;
      }[],
    });
  }

  // append a set of merchants, accounts, and transactions to the seed data
  for (const profile of seedData) {
    for (let i = 0; i < 10; i += 1) {
      profile.accounts.push({
        id: faker.string.uuid(),
        title: faker.finance.accountName(),
      });
      profile.categories.push({
        id: faker.string.uuid(),
        title: faker.commerce.department(),
      });
      profile.merchants.push({
        id: faker.string.uuid(),
        title: faker.company.name(),
      });
    }

    for (let i = 0; i < 100; i += 1) {
      profile.transactions.push({
        amount:
          i % 10 === 0
            ? faker.number.int({ min: 45, max: 2600 })
            : faker.number.int({ min: -2000, max: -0.5 }),
        postedAt: faker.date.between({
          from: '2024-01-01T00:00:00.000Z',
          to: '2024-05-31T00:00:00.000Z',
        }),
        transactedAt: null,
        accountId: profile.accounts[Math.floor(Math.random() * 10)].id,
        merchantId: profile.merchants[Math.floor(Math.random() * 10)].id,
      });
    }
  }

  for (const user of seedData) {
    await prisma.user.create({
      data: {
        id: user.id,
        authId: user.authId,
        authSource: 'Seed',
        email: user.email,
        name: user.name,
      },
    });

    for (const account of user.accounts) {
      await prisma.account.create({
        data: {
          id: account.id,
          title: account.title,
          userId: user.id,
        },
      });
    }

    for (const category of user.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          title: category.title,
          userId: user.id,
        },
      });
    }

    for (const merchant of user.merchants) {
      await prisma.merchant.create({
        data: {
          id: merchant.id,
          title: merchant.title,
        },
      });
    }

    for (const transaction of user.transactions) {
      await prisma.transaction.create({
        data: {
          id: faker.string.uuid(),
          amount: transaction.amount,
          merchantId: transaction.merchantId,
          accountId: transaction.accountId,
          postedAt: transaction.postedAt,
          transactedAt: transaction.transactedAt,
          userId: user.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
