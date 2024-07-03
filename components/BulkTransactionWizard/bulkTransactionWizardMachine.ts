import { assign, fromPromise, setup, spawnChild } from 'xstate';
import { bulkCreateTransactions } from '~/routes/api.bulkCreateTransactions';
import { CollectTransactionFile } from '../CollectTransactionFile/CollectTransactionFile';
import { createAccount } from '~/routes/api.createAccount';
import { createAccountRecordSchema } from 'prisma/validators';
import { getAccounts } from '~/routes/api.getAccounts';
import { parseFileAsync } from '~/utils/parseFileAsync';
import { SelectAccount } from '../SelectAccount/SelectAccount';
import { z } from 'zod';
import type { Account } from '@prisma/client';
import type { BulkCreateTransactionRecord } from 'prisma/validators';
import {
  MatchFileColumnFields,
  type ColumnFieldMap,
} from 'components/MatchFileColumnFields/MatchFileColumnFields';
import { ConfirmAmountSign } from 'components/ConfirmAmountSign';
import { BulkUploadSuccess } from 'components/BulkUploadSuccess';

export interface ParsedFileData {
  headerRow: string[];
  bodyRows: string[][];
}

type BulkTransactionInputMachineContext = {
  StateUI: ClosureComponent;
  transactionFile?: File;
  accounts: Account[];
  accountId?: string;
  columnFieldMap?: ColumnFieldMap;
  parsedFileData?: ParsedFileData;
  /**
   * Amounts are stored in the database in cents, so this will typically be 100.
   * In some cases vendors will reverse the sign of the amount (a credit card
   * charge will be listed as a positive, and a payment as a negative), so this
   * value can compensate for that too.
   */
  amountTransformationFactor: number;
  currentRowIndex: number;
  normalizedTransactionData: BulkCreateTransactionRecord;
};

type BulkTransactionInputMachineEvents =
  | { type: 'SUBMIT_FILE'; file: File }
  | { type: 'CHOOSE_ACCOUNT'; accountId: string }
  | { type: 'CONFIRM_MERCHANT_ID'; merchantId: string }
  | { type: 'DECREMENT_ROW' }
  | { type: 'INCREMENT_ROW' }
  // TODO: decide on whether this should be FormData or an object, ripple the change across the various components
  | {
      type: 'CREATE_ACCOUNT';
      accountData: Omit<z.infer<typeof createAccountRecordSchema>, 'userId'>;
    }
  | { type: 'SUBMIT_AMOUNT_TRANSFORMATION_FACTOR'; factor: number }
  | { type: 'SUBMIT_COLUMN_FIELD_MAP'; columnFieldMap: ColumnFieldMap }
  | { type: 'EXIT_WIZARD' };

type ClosureComponent = React.FC<{
  send: (event: BulkTransactionInputMachineEvents) => void;
}>;

export const bulkTransactionInputMachine = setup({
  types: {
    context: {} as BulkTransactionInputMachineContext,
    events: {} as BulkTransactionInputMachineEvents,
  },
  actions: {
    dispatchFinalAction: () =>
      console.warn(
        'action `dispatchFinalAction` is undefined; must be provided when the actor is started'
      ),
  },
  actors: {
    getAccounts: fromPromise(getAccounts),
    createNewAccount: fromPromise(
      async ({ input: { formData } }: { input: { formData: FormData } }) => {
        return await createAccount(formData);
      }
    ),
    parseCSV: fromPromise(
      async ({ input: { file } }: { input: { file: File } }) => {
        return await parseFileAsync(file);
      }
    ),
    bulkCreateTransactions: fromPromise(
      ({ input }: { input: { transactions: BulkCreateTransactionRecord } }) =>
        bulkCreateTransactions(input.transactions)
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOkwHsAbSsTAFwBUAndfWLO3c-AMVxoDEAZQCqAIQCyASQYB9HlIAyAUQDaABgC6iUAAdysXJ246QAD0QAmdQGYSARgBsAVgAczx64AslmwE5HP0sAGhAAT0R7axIfVxsAdld1Zy9k7xsAXwzQtCw8QlIAMzA6HABBTAoAV3w6WAEIbjASAgA3cgBrZtycAmISYtLsCura2AQ28kx0Y3wNTXnTfUNZ0wsEe1dXEn8EzZ9HZPt40IiEGx8SS1TLS0d7Ly8Lv3UvLJyMXoKSWDAaehG5BqdAEAGEABIAeUhQmUsjKoNBkJEADkGIskCBlkYuPg1pEniQ-A9nM5NocDsdTogPNt4s54uooikvPFWa53iAevl+r9-nRAcCwQAlZRlBhwhFI1HorRLAw4kyY9b+bbqe72GyWBk+ex+eKOannVIkeL+RzXIIeGyuY6c7l9Ui6dBMX58QSNQgtfDtLokZ2usDusAYvQK1bKyJ+Pw7aMMjykzbOI1JeIkMn09U2Fzkxz2z48p0ut38MACMBMJjkJj+ygzQrV1D+4tB0uhrHh3H4hAAWkcVxS8UsjP1d1JQ6N2a8RMcXlcvkzLyZ+byjpIGCGoKoVVQbAY5D4fwg9VEkhksiRihEEhR8ikykUABFZBIygAFdvYiOgdYPdTp9Q-GcPwkmzId4ggo17FsSwSBcdR4k1RkDUsVx4hXL5+g3HAJArHBWDqfdmFYdh6FxE9xGkOQGGFMoUSEBEGCkSFb0fcUylkAB1GRwRfZRhQhOi5CkR8hE-TslR-Glp2cGwbBgskvGcYcmSgu57BiRwXAtB4EiHZwMMLEgACMqkoDpQSYMAZjAYi2A4ciGiab1fW6As11M8zLOsuhbJYeyyO4cZJmmWZ5nElYu0jDYUlNVxAlk9lUgtVwoKUjSfCCID7AeLxNSybIQHwcgIDgUwHQKeVIsk8xEB7WLtVZFTRxcBkjR7eIYyAmwPFsWT1DiW5DLXChqFoRh-NI2ZgyqxU8Wi45YOzZwEJ64CgkSZNwkQNNsz8HqbScaMLRtYbvkGcpKiBMZZu-WqNjZdM5NeHqAkcHqQm2hBfA0211EAkd7nk+czt5P5xsFWpbqiqSNmjODriTedLGJJkvCNJS7HpEDzWOJJbHQwqKv6AMSxoaGat-OcAKeYlsoSLwtKNQJYKZBCQLyo4ENB0hsOwLdKB3PcD1wI94ExL8Yfupw01ZHUzVcfV9nRr7iVl6CojiKJ7jynn1xmHC8OwAjYCIyaHKCin5thzVnHTNwnjSW4tKpL6cuUhwPCR9k4gMon3O+TyLKsmy7Km8ire7P8iTuYdh327M9UNN25LTRCdK8AIon2yw9c9MBI+iyx7DtpW4j8J5oPnLUoOUjS3GL6CbCr-aCoyIA */
  context: {
    // initialize the component context so we don't need to add a conditional render check in the JSX
    StateUI: CollectTransactionFile,
    accounts: [],
    currentRowIndex: 0,
    amountTransformationFactor: 100,
    normalizedTransactionData: [],
  },
  initial: 'collectTransactionFile',
  states: {
    collectTransactionFile: {
      entry: [assign(() => ({ StateUI: CollectTransactionFile }))],
      on: {
        SUBMIT_FILE: {
          actions: [assign(({ event }) => ({ transactionFile: event.file }))],
          target: 'fetchAccounts',
        },
      },
    },

    // TODO: consider integrating an onError handler
    fetchAccounts: {
      invoke: {
        src: 'getAccounts',
        onDone: {
          actions: [assign(({ event }) => ({ accounts: event.output.data }))],
          target: 'selectAccount',
        },
      },
    },

    // TODO: determine how the modal should be displayed for this state... should it be a sub-state? or...? (this feels connected with the error state in createAccount tbh)
    selectAccount: {
      entry: [
        assign(({ context }) => ({
          StateUI: ({ send }) =>
            SelectAccount({ send, accounts: context.accounts }),
        })),
      ],
      on: {
        CHOOSE_ACCOUNT: {
          actions: [assign(({ event }) => ({ accountId: event.accountId }))],
          target: 'parseFile',
          guard: ({ context }) => !!context.transactionFile,
        },
        CREATE_ACCOUNT: {
          actions: [
            ({ event }) =>
              spawnChild('createNewAccount', {
                input: { formData: event.accountData },
              }),
          ],
          target: 'fetchAccounts',
        },
      },
    },

    parseFile: {
      // TODO: consider add a loading component for this step
      entry: [],
      invoke: [
        {
          id: 'parseFile',
          src: 'parseCSV',
          input: ({ context: { transactionFile } }) => ({
            file: transactionFile as File,
          }),
          onDone: {
            target: 'matchColumnsToFields',
            actions: assign(({ event }) => {
              const validatedBodyRows = [];
              const headerCount = event.output[0].length;
              const headerRow = event.output[0];
              // sanity check to ensure the parsed data is well-formed
              for (const row of event.output) {
                if (row === headerRow) continue;
                if (row.length < headerCount) continue;
                validatedBodyRows.push(row);
              }
              return {
                parsedFileData: { headerRow, bodyRows: validatedBodyRows },
                parsedFileRowCount: validatedBodyRows.length,
              };
            }),
          },
          // TODO: Consider adding some error handling with toasts to better inform the user why they got bounced
          onError: {
            target: 'collectTransactionFile',
          },
        },
      ],
    },

    matchColumnsToFields: {
      entry: [
        assign(({ context }) => ({
          StateUI: ({ send }) =>
            MatchFileColumnFields({
              send,
              columnHeaders: context.parsedFileData?.headerRow ?? [],
            }),
        })),
      ],
      on: {
        SUBMIT_COLUMN_FIELD_MAP: {
          actions: [
            assign(({ event }) => ({ columnFieldMap: event.columnFieldMap })),
          ],
          target: 'confirmAmountSign',
        },
      },
    },

    confirmAmountSign: {
      entry: [
        assign(({ context }) => ({
          StateUI: ({ send }) => {
            // transform the parsed file data into the format necessary for the component:
            const descriptionAndAmountData =
              // lots of type coercion because we previously set this value in the state machine
              context.parsedFileData!.bodyRows.map((row) => ({
                amount: row[context.columnFieldMap!.amount],
                description: row[context.columnFieldMap!.description!],
              }));

            return ConfirmAmountSign({
              send,
              descriptionAndAmountData,
            });
          },
        })),
      ],
      on: {
        SUBMIT_AMOUNT_TRANSFORMATION_FACTOR: {
          actions: [
            assign(({ event }) => ({
              amountTransformationFactor: event.factor,
            })),
          ],
          target: 'normalizeTransactionData',
        },
      },
    },

    // normalize the data from the CSV file ahead of posting to the endpoint
    normalizeTransactionData: {
      always: {
        actions: [
          assign(({ context }) => {
            if (
              !context.columnFieldMap ||
              !context.accountId ||
              !context.parsedFileData?.bodyRows
            ) {
              // TODO: consider adding more robust error handling here
              // (although it's likely not necessary because the state machine is robust)
              return {};
            }

            const normalizedData = [] as BulkCreateTransactionRecord;

            for (const row of context.parsedFileData.bodyRows) {
              normalizedData.push({
                accountId: context.accountId,
                amount: parseInt(
                  (
                    Number(
                      row[context.columnFieldMap.amount].replace(/[$]/i, '')
                    ) * 100
                  ).toFixed(0)
                ),
                description: null,
                merchantDescription: row[context.columnFieldMap.description],
                postedAt: new Date(row[context.columnFieldMap.clearedAt]),
                transactedAt: context.columnFieldMap.transactedAt
                  ? new Date(row[context.columnFieldMap.transactedAt])
                  : null,
              });
            }

            return { normalizedTransactionData: normalizedData };
          }),
        ],
        target: 'bulkCreateTransactions',
      },
    },

    bulkCreateTransactions: {
      // TODO: consider adding some loading UI upon entry
      invoke: {
        src: 'bulkCreateTransactions',
        input: ({ context }) => ({
          transactions: context.normalizedTransactionData!,
        }),
        onDone: 'successScreen',
        // TODO: consider making the error handling more user-friendly
        onError: 'collectTransactionFile',
      },
    },

    successScreen: {
      entry: [
        assign(() => ({ StateUI: ({ send }) => BulkUploadSuccess({ send }) })),
      ],
      on: {
        EXIT_WIZARD: { target: 'done' },
      },
    },

    done: {
      entry: 'dispatchFinalAction',
      type: 'final',
    },
  },
});
