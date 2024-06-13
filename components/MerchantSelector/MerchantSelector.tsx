import { Merchant } from '@prisma/client';
import { ParsedFileData } from 'components/BulkTransactionWizard/bulkTransactionWizardMachine';
import { ColumnFieldMap } from 'components/MatchFileColumnFields/MatchFileColumnFields';
import { MerchantSelectorComboBox } from 'components/MerchantSelectorComboBox';
import { Button } from 'primitives/Button';
import {
  BulkCreateTransactionRecord,
  createMerchantRecordSchema,
} from 'prisma/validators';

import { z } from 'zod';

export const MerchantSelector = ({
  send,
  accountId,
  columnFieldMap,
  parsedFileData,
  currentRowIndex,
  confirmedFileData,
  merchants,
}: {
  send: (
    event:
      | {
          type: 'SUBMIT_TRANSACTION_DATA_WITH_MERCHANT_IDS';
          normalizedDataWithMerchantIDs: BulkCreateTransactionRecord;
        }
      | {
          type: 'CREATE_MERCHANT';
          merchantData: Omit<
            z.infer<typeof createMerchantRecordSchema>,
            'userId'
          >;
        }
      | {
          type: 'SET_CONFIRMED_FILE_DATA';
          confirmedFileData: BulkCreateTransactionRecord;
        }
      | { type: 'DECREMENT_ROW' }
      | { type: 'INCREMENT_ROW' }
  ) => void;
  accountId: string;
  columnFieldMap: ColumnFieldMap;
  parsedFileData: ParsedFileData;
  currentRowIndex: number;
  confirmedFileData: BulkCreateTransactionRecord;
  merchants: Merchant[];
}) => {
  const rowCount = parsedFileData.bodyRows.length;

  const amount =
    parsedFileData.bodyRows[currentRowIndex][columnFieldMap.amount];
  const description =
    parsedFileData.bodyRows[currentRowIndex][columnFieldMap.description];
  const clearedAt =
    parsedFileData.bodyRows[currentRowIndex][columnFieldMap.clearedAt];
  const transactedAt = columnFieldMap.transactedAt
    ? parsedFileData.bodyRows[currentRowIndex][columnFieldMap.transactedAt]
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-md border-2 border-gray-400 bg-white p-3">
        <div className="max-w-full flex-grow">
          <p className="text-sm font-semibold uppercase text-cyan-600">
            Transaction
          </p>
          <h2 className="text-2xl">{description}</h2>
        </div>
        <div className="flex w-full justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-600">
              Amount
            </p>
            <h3 className="text-right text-2xl">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(
                parseInt(
                  (Number(amount.replace(/[$]/i, '')) * 100).toFixed(0)
                ) / 100
              )}
            </h3>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-600">
              Closing date
            </p>
            <h3 className="text-right text-2xl">{clearedAt}</h3>
          </div>
          {transactedAt && (
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-600">
                Transaction Date
              </p>
              <h3 className="text-right text-2xl">{transactedAt}</h3>
            </div>
          )}
        </div>
      </div>
      <MerchantSelectorComboBox
        // NOTE: This is mandatory
        // By changing the key every time we change the row, we force a total component recreation
        // which resets the FSM to it's initial state. Otherwise the component will preserve stale data
        key={currentRowIndex}
        merchants={merchants}
        // if it's a new row, set to empty string
        // else, set it to whatever it was set to before
        defaultMerchantId={confirmedFileData[currentRowIndex]?.merchantId ?? ''}
        setMerchantId={(merchantId) => {
          if (!z.string().uuid().safeParse(merchantId).success) return;

          const newEntry = {
            // remove the dollar sign, convert cents to dollars, then wipe out any decimal cents and coerce to an integer
            amount: parseInt(
              (Number(amount.replace(/[$]/i, '')) * 100).toFixed(0)
            ),
            accountId,
            merchantId,
            description: description,
            postedAt: new Date(clearedAt),
            transactedAt: transactedAt ? new Date(transactedAt) : null,
          };

          const newData = [...confirmedFileData];
          if (currentRowIndex === newData.length) {
            newData.push(newEntry);
          } else {
            newData.splice(currentRowIndex, 1, newEntry);
          }
          return send({
            type: 'SET_CONFIRMED_FILE_DATA',
            confirmedFileData: newData,
          });
        }}
        createMerchant={(arg) =>
          send({
            type: 'CREATE_MERCHANT',
            merchantData: { title: arg.title, description: arg.description },
          })
        }
      />
      <div className="flex w-full items-center justify-between">
        <Button
          variant="secondary"
          disabled={currentRowIndex === 0}
          className="w-fit self-end"
          onClick={() => {
            // setCurrentRowIndex((prev) => (prev > 0 ? prev - 1 : prev));
            send({ type: 'DECREMENT_ROW' });
          }}
        >
          Back
        </Button>

        <p className="text-gray-400">{`${currentRowIndex + 1} of ${rowCount}`}</p>

        <Button
          variant="primary"
          disabled={
            !confirmedFileData[currentRowIndex] ||
            confirmedFileData[currentRowIndex].merchantId === ''
          }
          className="w-fit self-end"
          onClick={
            currentRowIndex + 1 === rowCount
              ? () =>
                  send({
                    type: 'SUBMIT_TRANSACTION_DATA_WITH_MERCHANT_IDS',
                    normalizedDataWithMerchantIDs: confirmedFileData,
                  })
              : () => {
                  // setCurrentRowIndex((prev) =>
                  //   prev + 1 < rowCount ? prev + 1 : prev
                  // );
                  send({ type: 'INCREMENT_ROW' });
                }
          }
        >
          {currentRowIndex + 1 === rowCount ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
