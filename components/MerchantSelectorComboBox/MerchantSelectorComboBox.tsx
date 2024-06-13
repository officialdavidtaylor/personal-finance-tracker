import { Button } from 'primitives/Button';
import type { Merchant } from '@prisma/client';
import { optionSelectorMachine } from './optionSelectorMachine';
import { useActor } from '@xstate/react';
import { useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import type { OptionSelectorMachineContext } from './optionSelectorMachine';

export const MerchantSelectorComboBox = ({
  merchants,
  defaultMerchantId,
  setMerchantId,
  createMerchant,
}: {
  merchants: Merchant[];
  defaultMerchantId?: string;
  setMerchantId: (merchantId: string) => void;
  createMerchant: ({
    title,
    description,
  }: {
    title: string;
    description: string | null;
  }) => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const merchantsById = useMemo(() => {
    const merchantMap = new Map<string | undefined, string>();
    for (const { id, title } of merchants) {
      merchantMap.set(id, title);
    }
    return merchantMap;
  }, [merchants]);

  const [state, send] = useActor(
    optionSelectorMachine.provide({
      actions: {
        dispatchParentSetMerchantId: ({
          context,
        }: {
          context: OptionSelectorMachineContext;
        }) => {
          setMerchantId(context.selectedOption.id);
        },
        createMerchant: ({ context }) =>
          createMerchant({
            title: context.currentInput,
            description: null,
          }),
      },
    }),
    {
      input: {
        options: merchants,
        currentInput: merchantsById.get(defaultMerchantId) ?? '',
      },
    }
  );
  const { filteredOptions, currentInput } = state.context;

  return (
    <>
      <div className="relative flex flex-col">
        <label
          htmlFor="merchantTitle"
          className="pb-2 font-semibold text-cyan-600"
        >
          Choose merchant
        </label>
        <div className="flex gap-1 rounded-md border-2 border-gray-400 bg-white ring-offset-1 focus-within:ring-2 focus-within:ring-cyan-500">
          <input
            // Control the input so we can set it from the popover
            id="merchantTitle"
            type="text"
            className="w-full text-ellipsis border-0 bg-transparent focus:ring-transparent"
            value={currentInput}
            onChange={(e) => {
              send({
                type: 'UPDATE_INPUT_TEXT',
                titleInput: e.target.value,
              });
            }}
            onFocus={() => {
              send({ type: 'ACTIVATE' });
            }}
            onBlur={(e) => {
              // only deactivate if we're clicking off the combobox entirely
              // if we're clicking on a child element of the menu, don't deactivate
              if (menuRef.current && !menuRef.current.contains(e.relatedTarget))
                send({ type: 'DEACTIVATE' });
            }}
          />
          <button
            onClick={() => {
              // reset the input field
              send({ type: 'UPDATE_INPUT_TEXT', titleInput: '' });
            }}
            className="aspect-square p-2"
          >
            <X className="stroke-gray-500 stroke-[3]" size={16} />
          </button>
        </div>
        {state.matches('active') && (
          <>
            <div
              ref={menuRef}
              // Safari will not set this element as the relatedTarget unless the tabindex is set
              tabIndex={-1}
              className="absolute top-20 mt-2 flex max-h-60 w-full flex-col overflow-y-scroll rounded-md border-2 border-gray-200 bg-white shadow-md"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map(({ id, title }) => (
                  <button
                    key={id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-200"
                    tabIndex={0}
                    onClick={() => {
                      send({
                        type: 'SELECT_OPTION',
                        id,
                        title,
                      });
                    }}
                  >
                    {title}
                  </button>
                ))
              ) : (
                <p className="w-full px-4 py-2 text-left text-gray-500">
                  No results
                </p>
              )}
              <div className="flex flex-col items-start gap-2 py-2">
                <div className="flex w-full items-center justify-between gap-1 px-2">
                  <Button
                    variant="unstyled"
                    size="small"
                    className="flex w-full items-center gap-2 rounded border-2 border-solid border-gray-400 bg-white px-2 font-normal hover:bg-gray-100"
                    onClick={() => send({ type: 'CREATE_OPTION' })}
                  >
                    <span className="font-semibold text-cyan-600">Create</span>
                    <span className="text-left font-normal text-black">
                      {currentInput}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
