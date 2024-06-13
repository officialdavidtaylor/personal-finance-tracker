import { fn } from '@storybook/test';
import { SelectAccount } from '../SelectAccount';
import type { Meta, StoryObj } from '@storybook/react';
import { faker } from '@faker-js/faker';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/SelectAccount',
  component: SelectAccount,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { send: fn() },
} satisfies Meta<typeof SelectAccount>;

export default meta;
type Story = StoryObj<typeof meta>;

const testData = [];
const testUserId = faker.string.uuid();
for (let i = 0; i < 7; i += 1) {
  testData.push({
    title: `Test Account ${i}`,
    type: faker.finance.accountName().replace(/ Account$/, ''),
    id: faker.string.uuid(),
    createdAt: new Date(),
    userId: testUserId,
    accentColor: null,
    dateFirstAvailable: null,
  });
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    accounts: testData,
    send: fn(),
  },
};
