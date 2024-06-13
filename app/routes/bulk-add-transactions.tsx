import { useNavigate } from '@remix-run/react';
import { useActor } from '@xstate/react';
import { bulkTransactionInputMachine } from 'components/BulkTransactionWizard/bulkTransactionWizardMachine';

export default function Index() {
  const navigate = useNavigate();
  const [state, send] = useActor(
    bulkTransactionInputMachine.provide({
      actions: {
        dispatchFinalAction: () => navigate('/dashboard'),
      },
    })
  );
  const { StateUI } = state.context;
  return (
    <div className="h-full">
      <StateUI send={send} />
    </div>
  );
}
