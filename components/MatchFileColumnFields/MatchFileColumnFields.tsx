import { Button } from 'primitives/Button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const columnFieldMapSchema = z.object({
  amount: z.string().transform((input, ctx) => {
    if (input === '-1') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select an option from the list',
      });
      return z.NEVER;
    }
    return Number(input);
  }),
  clearedAt: z.string().transform((input, ctx) => {
    if (input === '-1') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select an option from the list',
      });
      return z.NEVER;
    }
    return Number(input);
  }),
  description: z.string().transform((input, ctx) => {
    if (input === '-1') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select an option from the list',
      });
      return z.NEVER;
    }
    return Number(input);
  }),
  transactedAt: z.nullable(z.string()).transform((input) => {
    if (input === 'null') return null;
    return Number(input);
  }),
});

export type ColumnFieldMap = z.infer<typeof columnFieldMapSchema>;

export const MatchFileColumnFields = ({
  send,
  columnHeaders,
}: {
  send: (event: {
    type: 'SUBMIT_COLUMN_FIELD_MAP';
    columnFieldMap: ColumnFieldMap;
  }) => void;
  columnHeaders: string[];
}) => {
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<ColumnFieldMap>({
    resolver: zodResolver(columnFieldMapSchema),
  });

  return (
    <>
      <form
        onSubmit={handleSubmit((columnFieldMap) =>
          send({ type: 'SUBMIT_COLUMN_FIELD_MAP', columnFieldMap })
        )}
        className="flex h-full min-h-48 flex-grow flex-col gap-4 py-4"
      >
        <div className="flex flex-col gap-2">
          <legend className="h-fit text-lg opacity-60">
            Confirm the CSV headers match the transaction field data
          </legend>
          <label htmlFor="description" className="font-semibold text-cyan-600">
            Description <span className="text-red-400">*</span>
          </label>
          <select
            {...register('description')}
            defaultValue={columnHeaders.findIndex((header) =>
              header.toLowerCase().includes('desc')
            )}
            className="form-select rounded-md border-2 border-gray-400 bg-white outline-none ring-offset-1 focus-within:ring-2 focus-within:ring-cyan-500 focus:border-gray-400"
          >
            <option value="null" disabled className="text-gray-300"></option>
            {columnHeaders.map((header, index) => (
              <option key={header} value={index}>
                {header}
              </option>
            ))}
          </select>
          {errors.description && (
            <p
              aria-live="assertive"
              aria-errormessage="Account selector radio group"
              className="text-red-500"
            >
              {errors.description?.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="amount" className="font-semibold text-cyan-600">
            Amount <span className="text-red-400">*</span>
          </label>
          <select
            {...register('amount')}
            defaultValue={columnHeaders.findIndex(
              (header) => header.toLowerCase() === 'amount'
            )}
            className="form-select rounded-md border-2 border-gray-400 bg-white outline-none ring-offset-1 focus-within:ring-2 focus-within:ring-cyan-500 focus:border-gray-400"
          >
            <option value="-1" disabled className="text-gray-300"></option>
            {columnHeaders.map((header, index) => (
              <option key={header} value={index}>
                {header}
              </option>
            ))}
          </select>
          {errors.amount && (
            <p
              aria-live="assertive"
              aria-errormessage="Account selector radio group"
              className="text-red-500"
            >
              {errors.amount?.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="clearedAt" className="font-semibold text-cyan-600">
            Posting Date / Clearing Date <span className="text-red-400">*</span>
          </label>
          <select
            {...register('clearedAt')}
            defaultValue={columnHeaders.findIndex((header) => {
              const h = header.toLowerCase();
              return (
                h.includes('clear') || h.includes('clos') || h.includes('post')
              );
            })}
            className="form-select rounded-md border-2 border-gray-400 bg-white outline-none ring-offset-1 focus-within:ring-2 focus-within:ring-cyan-500 focus:border-gray-400"
          >
            <option value="-1" disabled className="text-gray-300"></option>
            {columnHeaders.map((header, index) => (
              <option key={header} value={index}>
                {header}
              </option>
            ))}
          </select>
          {errors.clearedAt && (
            <p
              aria-live="assertive"
              aria-errormessage="Account selector radio group"
              className="text-red-500"
            >
              {errors.clearedAt?.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <label
              htmlFor="transactedAt"
              className="font-semibold text-cyan-600"
            >
              Transaction Date
            </label>
            <span className="pl-2 text-gray-400">(optional)</span>
          </div>
          <select
            {...register('transactedAt')}
            defaultValue={columnHeaders.findIndex((header) =>
              header.toLowerCase().includes('transact')
            )}
            className="form-select rounded-md border-2 border-gray-400 bg-white outline-none ring-offset-1 focus-within:ring-2 focus-within:ring-cyan-500 focus:border-gray-400"
          >
            <option value="-1" disabled className="text-gray-300"></option>
            {columnHeaders.map((header, index) => (
              <option key={header} value={index}>
                {header}
              </option>
            ))}
          </select>
          {errors.transactedAt && (
            <p
              aria-live="assertive"
              aria-errormessage="Account selector radio group"
              className="text-red-500"
            >
              {errors.transactedAt?.message}
            </p>
          )}
        </div>

        <Button className="mt-auto flex w-fit self-end" type="submit">
          Confirm
        </Button>
      </form>
    </>
  );
};
