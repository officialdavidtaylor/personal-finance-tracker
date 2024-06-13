import { faker } from '@faker-js/faker';
import { fn } from '@storybook/test';
import { Merchant } from '@prisma/client';
import { MerchantSelector } from '../MerchantSelector';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/MerchantSelector',
  component: MerchantSelector,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'padded',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    send: fn(),
    confirmedFileData: [],
    currentRowIndex: 0,
  },
} satisfies Meta<typeof MerchantSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const testMerchantArray: Merchant[] = [];
for (let i = 0; i < 100; i += 1) {
  testMerchantArray.push({
    id: faker.string.uuid(),
    description: faker.company.buzzPhrase(),
    title: faker.company.name(),
  });
}

const parsedFileData = {
  headerRow: ['description', 'amount', 'date'],
  bodyRows: [
    ['COSTCO WHSE #1001', '$1.62', '2024-06-12'],
    ['SPROUTS FARMERS MARKE', '$7.32', '2024-06-12'],
    ['Amazon eCommerce Enterprises', '$37.77', '2024-06-12'],
  ],
};

const Wrapper = (props: Parameters<typeof MerchantSelector>[0]) => {
  const [merchants, setMerchants] = useState(props.merchants);
  console.log({ Wrapper });
  return MerchantSelector({
    ...props,
    merchants,
    send: fn((event) => {
      if (event.type === 'CREATE_MERCHANT')
        setMerchants((prev) => [
          ...prev,
          {
            id: faker.string.uuid(),
            title: event.merchantData.title,
            description: event.merchantData.description,
          },
        ]);
    }),
  });
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  render: Wrapper,
  args: {
    parsedFileData,
    merchants: testMerchantArray,
    accountId: faker.string.uuid(),
    columnFieldMap: {
      amount: 1,
      clearedAt: 2,
      description: 0,
      transactedAt: null,
    },
  },
};
