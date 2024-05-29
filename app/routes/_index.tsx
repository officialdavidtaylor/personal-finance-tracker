import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Finance Tracker' },
    {
      name: 'description',
      content: 'A simple web tool to track and categorize spending.',
    },
  ];
};

export default function Index() {
  return (
    <div>
      <p>A revolution in simple personal finance tracking</p>
      <p>Coming soon!</p>
    </div>
  );
}
