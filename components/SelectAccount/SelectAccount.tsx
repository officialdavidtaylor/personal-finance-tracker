import { Button } from 'primitives/Button';
import { cx } from 'cva';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Account } from '@prisma/client';

const accountIdFieldSchema = z.object({
  accountId: z.string({ message: 'Please select an account.' }).uuid({
    message:
      'Error detected: sadly you may need to contact the developer over this one',
  }),
});

type AccountIdField = z.infer<typeof accountIdFieldSchema>;

export const SelectAccount = ({
  send,
  accounts,
}: {
  send: (event: { type: 'CHOOSE_ACCOUNT'; accountId: string }) => void;
  accounts: Account[];
}) => {
  const {
    formState: { errors, dirtyFields },
    register,
    handleSubmit,
  } = useForm<AccountIdField>({
    resolver: zodResolver(accountIdFieldSchema),
  });

  return (
    <>
      <form
        onSubmit={handleSubmit(({ accountId }) =>
          send({ type: 'CHOOSE_ACCOUNT', accountId })
        )}
        className="flex h-full min-h-48 flex-grow flex-col gap-4 py-4"
      >
        <legend className="h-fit text-lg font-semibold text-cyan-600">
          Select an account
        </legend>
        <fieldset className="grid h-fit grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {accounts.map((account) => (
            <div key={account.id}>
              <input
                type="radio"
                value={account.id}
                className="peer hidden"
                id={account.id}
                {...register('accountId')}
              />
              <label
                htmlFor={account.id}
                className={cx(
                  dirtyFields.accountId
                    ? 'opacity-60 peer-checked:opacity-100'
                    : '',
                  'duration-250 flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-4 border-transparent bg-white p-4 transition-all ease-in-out hover:shadow-md peer-checked:border-cyan-500'
                )}
              >
                <h2 className="text-center text-lg font-semibold">
                  {account.title}
                </h2>
                {!!account.type && (
                  <p className="text-sm text-gray-500">{account.type}</p>
                )}
              </label>
            </div>
          ))}
        </fieldset>
        {errors.accountId && (
          <p
            aria-live="assertive"
            aria-errormessage="Account selector radio group"
            className="text-red-500"
          >
            {errors.accountId?.message}
          </p>
        )}

        <Button className="mt-auto flex w-fit self-end" type="submit">
          Continue
        </Button>
      </form>
    </>
  );
};
