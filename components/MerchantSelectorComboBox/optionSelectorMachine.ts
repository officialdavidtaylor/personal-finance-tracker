import { assign, setup } from 'xstate';
import { z } from 'zod';

const optionSchema = z.object({
  title: z.string(),
  id: z.string().uuid(),
});

type Option = z.infer<typeof optionSchema>;

export interface OptionSelectorMachineContext {
  options: Option[];
  filteredOptions: Option[];
  selectedOption: Option;
  currentInput: string;
  previousInput: string;
}

export type OptionSelectorMachineEvents =
  | { type: 'ACTIVATE' }
  | { type: 'CREATE_OPTION' }
  | { type: 'DEACTIVATE' }
  | { type: 'UPDATE_INPUT_TEXT'; titleInput: string }
  | {
      type: 'SELECT_OPTION';
      title: string;
      id: string;
    }
  | {
      type: 'INSERT_NEW_OPTION';
      title: string;
      id?: string;
    };

export const optionSelectorMachine = setup({
  types: {
    context: {} as OptionSelectorMachineContext,
    events: {} as OptionSelectorMachineEvents,
    input: {} as Partial<OptionSelectorMachineContext>,
  },
  actions: {
    filterOptions: assign({
      filteredOptions: ({ context }) =>
        context.options.filter(({ title }) =>
          title.toLowerCase().startsWith(context.currentInput.toLowerCase())
        ),
    }),
    dispatchParentSetMerchantId: () => {
      console.warn(
        'action `setOptionId` is undefined; it must be provided at the time the actor is started'
      );
    },
    createMerchant: () => {
      console.warn(
        'action `createMerchant` is undefined; it must be provided at the time the actor is started'
      );
    },
    setOptionId: () => {
      console.warn(
        'action `setOptionId` is undefined; it must be provided at the time the actor is started'
      );
    },
    sortOptions: assign({
      filteredOptions: ({ context: { options } }) =>
        options.sort((a, b) => a.title.localeCompare(b.title)),
    }),
  },
  guards: {
    optionIsResettable: ({ context }) => {
      return (
        context.selectedOption.id !== '' || context.selectedOption.title !== ''
      );
    },
  },
}).createMachine({
  context: ({ input }) => ({
    options: input.options ?? [],
    filteredOptions: input.options ?? [],
    selectedOption: { title: '', id: '' },
    currentInput: input.currentInput ?? '',
    previousInput: '',
  }),
  initial: 'initial',
  entry: ['sortOptions'],
  states: {
    initial: {
      on: { ACTIVATE: 'active' },
    },
    active: {
      on: {
        DEACTIVATE: 'inactive',
        CREATE_OPTION: {
          actions: ['createMerchant'],
        },
        SELECT_OPTION: {
          actions: [
            assign(({ context, event: { title, id } }) => ({
              selectedOption: { title, id },
              previousInput: context.currentInput,
              currentInput: title,
            })),
            'dispatchParentSetMerchantId',
          ],
          target: 'inactive',
        },
      },
    },
    inactive: {
      on: {
        ACTIVATE: 'active',
      },
    },
  },
  on: {
    UPDATE_INPUT_TEXT: {
      actions: [
        assign(({ context, event }) => ({
          previousInput: context.currentInput,
          currentInput: event.titleInput,
          selectedOption: { id: '', title: '' },
        })),
        'filterOptions',
        'dispatchParentSetMerchantId',
      ],
    },
  },
});
