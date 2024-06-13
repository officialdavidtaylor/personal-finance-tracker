import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Upload } from 'lucide-react';
import { Button } from 'primitives/Button';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// this schema uses the File prototype which is only available in the browser,
// hence the need for some definitional tomfoolery
let transactionFileInputSchema;
if (typeof document !== 'undefined') {
  transactionFileInputSchema = z.object({
    file: z
      // the value returned by an input of type="file" is a FileList
      .instanceof(FileList)
      // .instanceof(Blob)
      // ensure the FileList we collected has at least one item
      .refine(
        (fileList) => fileList && fileList.length === 1,
        'File type must be .csv'
      )
      // convert FileList into File
      .transform((fileList) => {
        return fileList[0];
      })
      // ensure the file has a CSV extension
      .refine((file) => {
        return file.type && file.type.includes('csv');
      }, 'File type must be .csv'),
  });
} else {
  transactionFileInputSchema = z.object({ file: z.never() });
}

type TransactionFileInput = z.infer<typeof transactionFileInputSchema>;

const nextButtonCopy = 'Continue';

export const CollectTransactionFile = ({
  send,
}: {
  send: (event: { type: 'SUBMIT_FILE'; file: File }) => void;
}) => {
  const { formState, register, handleSubmit } = useForm<TransactionFileInput>({
    resolver: zodResolver(transactionFileInputSchema),
  });

  const [fileSelected, setFileSelected] = useState(false);

  return (
    <>
      <form
        onSubmit={handleSubmit(({ file }) =>
          send({ type: 'SUBMIT_FILE', file })
        )}
        className="flex h-full min-h-48 flex-grow flex-col gap-4 py-4"
      >
        <label className="flex-grow">
          <div className="flex h-full max-h-full min-h-28 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dotted border-cyan-500 bg-white px-8 py-8 shadow-md transition-shadow duration-200 hover:border-cyan-600">
            {fileSelected ? (
              <>
                <Check className="stroke-cyan-600" />
                <h3 className="text-lg text-cyan-600">
                  {`File selected, tap "${nextButtonCopy}".`}
                </h3>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload />
                <h3 className="pt-2 text-lg">
                  <span className="font-semibold text-cyan-600 hover:cursor-pointer hover:text-cyan-800">
                    Choose file
                  </span>
                </h3>
                <p className="text-sm text-gray-500">
                  Transaction files must be in CSV format
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            {...register('file', {
              onChange: () => setFileSelected(true),
            })}
          />
          {formState.errors.file && (
            <p
              aria-errormessage="file"
              aria-live="assertive"
              className="text-red-500"
            >
              Please input a valid CSV file
            </p>
          )}
        </label>
        <Button className="flex w-fit self-end" type="submit">
          {nextButtonCopy}
        </Button>
      </form>
    </>
  );
};
