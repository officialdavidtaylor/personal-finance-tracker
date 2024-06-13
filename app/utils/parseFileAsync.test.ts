import { parseFileAsync } from './parseFileAsync';
import { describe, expect, it } from 'vitest';

describe('Utility regression: parseFileAsync validation', () => {
  // we start with the data we hope to get back after parsing; a 2D array
  const testData = [
    ['Date', 'Description', 'Amount'],
    ['2024-01-01', 'COSTCO WHSE #1001', '1.61'],
  ];

  // convert the test data into a single string in CSV format
  const csvStringOutput = testData.map((row) => row.join(',')).join('\n');

  // create a new File from our CSV string
  const testFile = new File([csvStringOutput], 'test.csv', {
    type: 'text/csv',
  });

  it('parses a simple, well-formed CSV file correctly', async () => {
    await expect(parseFileAsync(testFile)).resolves.toStrictEqual(testData);
  });
});
