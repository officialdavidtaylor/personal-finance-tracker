import { CircleCheck } from 'lucide-react';
import { Button } from 'primitives/Button';

export const BulkUploadSuccess = ({
  send,
}: {
  send: (event: { type: 'EXIT_WIZARD' }) => void;
}) => (
  <>
    <div className="flex h-full min-h-48 flex-grow flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 shadow-md">
      <div className="mb-4 flex flex-col items-center gap-4">
        <CircleCheck size={100} color="rgb(8 145 178)" />
        <h1 className="text-xl font-semibold text-cyan-600">Success</h1>
        <p className="text-center">
          Your transactions were imported successfully, and will be included in
          your dashboard and analytics.
        </p>
      </div>
      <Button
        className="flex w-fit"
        onClick={() => send({ type: 'EXIT_WIZARD' })}
      >
        Return to Dashboard
      </Button>
    </div>
  </>
);
