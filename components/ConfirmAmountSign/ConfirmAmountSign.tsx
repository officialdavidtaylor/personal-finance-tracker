import { Button } from 'primitives/Button';
import { cx } from 'cva';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const factorSchema = z.object({
  negate: z.boolean(),
});

type Factor = z.infer<typeof factorSchema>;

export const ConfirmAmountSign = ({
  send,
  descriptionAndAmountData,
}: {
  send: (event: {
    type: 'SUBMIT_AMOUNT_TRANSFORMATION_FACTOR';
    factor: number;
  }) => void;
  /** only displays up to the first 5 elements of the array */
  descriptionAndAmountData: { amount: string; description: string }[];
}) => {
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<Factor>({
    resolver: zodResolver(factorSchema),
  });

  const [tableData, setTableData] = useState(
    descriptionAndAmountData.map((row) => {
      const amountAsInt =
        0.01 *
        parseInt(
          // extract the dollar sign, any whitespace, and the decimal point
          row.amount.replace(/\s*\$?\s*(\d+)(?:\.|,)(\d{2})\s*/, '$1$2')
        );

      // re-cast to currency string
      const currencyAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amountAsInt);

      return { ...row, amount: currencyAmount };
    })
  );

  return (
    <div className="flex h-full min-h-48 flex-grow flex-col gap-4 py-4">
      <p>
        {
          'Before we import your data, please confirm if the amounts should be negated.'
        }
      </p>

      <div className="flex flex-col">
        <table className="w-full table-auto rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="rounded-tl-lg bg-cyan-200 p-4 text-left text-sm uppercase text-black text-opacity-60">
                Description
              </th>
              <th className="bg-cyan-200 p-4 text-right text-sm uppercase text-black text-opacity-60">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="table-row-group rounded-br-lg">
            {tableData.slice(0, 5).map(({ description, amount }, index) => (
              <tr
                key={index.toString() + amount.toString()}
                className="odd:bg-white last-of-type:rounded-b-lg"
              >
                <td className="table-cell px-4 py-4">
                  <p>{description}</p>
                </td>
                <td
                  className={cx(
                    'table-cell whitespace-nowrap px-4 py-4 text-right',
                    parseFloat(
                      // extract the dollar sign, any whitespace, and the decimal point
                      amount.replace(/\s*\$?\s*(\d+\.\d+)\s*/, '$1')
                    ) > 0
                      ? 'text-green-600'
                      : 'text-red-500'
                  )}
                >
                  {amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleSubmit((factor) =>
          send({
            type: 'SUBMIT_AMOUNT_TRANSFORMATION_FACTOR',
            factor: factor.negate ? -100 : 100,
          })
        )}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 font-semibold text-cyan-600">
            <input
              type="checkbox"
              {...register('negate')}
              onInput={() =>
                setTableData((data) =>
                  data.map((row) => {
                    // invert number sign:
                    const invertedAmount =
                      -0.01 *
                      parseInt(
                        // extract the dollar sign, any whitespace, and the decimal point
                        row.amount.replace(
                          /\s*\$?\s*(\d+)(?:\.|,)(\d{2})\s*/,
                          '$1$2'
                        )
                      );

                    // re-cast to currency string
                    const currencyAmount = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(invertedAmount);

                    return { ...row, amount: currencyAmount };
                  })
                )
              }
              className="form-checkbox rounded-md border-2 border-gray-400 bg-white text-cyan-600 outline-none ring-offset-1 focus-within:ring-2 focus-within:ring-cyan-500 focus:border-gray-400"
            />
            Negate amounts
          </label>
          {errors.negate && (
            <p
              aria-live="assertive"
              aria-errormessage="Account selector radio group"
              className="text-red-500"
            >
              {errors.negate?.message}
            </p>
          )}
        </div>

        <Button className="mt-auto flex w-fit self-end" type="submit">
          Confirm
        </Button>
      </form>
    </div>
  );
};
