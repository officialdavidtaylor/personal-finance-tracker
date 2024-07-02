import { fn } from '@storybook/test';
import { ConfirmAmountSign } from '../ConfirmAmountSign';
import type { Meta, StoryObj } from '@storybook/react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/ConfirmAmountSign',
  component: ConfirmAmountSign,
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
} satisfies Meta<typeof ConfirmAmountSign>;

export default meta;
type Story = StoryObj<typeof meta>;

const descriptionAndAmountData = [
  {
    description:
      'Zelle payment from _unknown person_ (Savings Account XXXXXXXXXX) to _insert friends name here_',
    amount: '2200.00',
  },
  { description: 'Payment Thank You-Mobile', amount: '270.00' },
  { description: 'TST* SOMBRERO MEXICAN FOO', amount: '-37.77' },
  { description: 'COSTCO WHSE #2332', amount: '-109.42' },
  { description: 'TRADER JOE S #123', amount: '-35.67' },
  { description: 'WHOLEFDS USA 45954', amount: '-31.94' },
];

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    descriptionAndAmountData,
    send: fn(),
  },
};
