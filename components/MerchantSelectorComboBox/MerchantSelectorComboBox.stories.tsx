import { faker } from '@faker-js/faker';
import { fn } from '@storybook/test';
import { Merchant } from '@prisma/client';
import { MerchantSelectorComboBox } from '../MerchantSelectorComboBox';
import type { Meta, StoryObj } from '@storybook/react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/MerchantSelectorComboBox',
  component: MerchantSelectorComboBox,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    setMerchantId: fn(),
    createMerchant: fn(async ({ input }) => {
      return new Promise((resolve) =>
        resolve({ title: input.title, id: faker.string.uuid() })
      );
    }),
  },
} satisfies Meta<typeof MerchantSelectorComboBox>;

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

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    merchants: testMerchantArray,
  },
};
