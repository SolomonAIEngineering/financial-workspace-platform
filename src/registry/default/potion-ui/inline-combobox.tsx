'use client';

import React, {
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { PointRef, TElement } from '@udecode/plate';

import { cn, withCn } from '@udecode/cn';
import { filterWords } from '@udecode/plate-combobox';
import {
  type UseComboboxInputResult,
  useComboboxInput,
  useHTMLInputCursorState,
} from '@udecode/plate-combobox/react';
import { useComposedRef, useEditorRef } from '@udecode/plate/react';
import { type VariantProps, cva } from 'class-variance-authority';

import { Ariakit } from './menu';

type FilterFn = (
  item: { value: string; group?: string; keywords?: string[]; label?: string },
  search: string
) => boolean;

interface InlineComboboxContextValue {
  filter: FilterFn | false;
  inputProps: UseComboboxInputResult['props'];
  inputRef: RefObject<HTMLInputElement | null>;
  removeInput: UseComboboxInputResult['removeInput'];
  showTrigger: boolean;
  trigger: string;
  setHasEmpty: (hasEmpty: boolean) => void;
}

const InlineComboboxContext = createContext<InlineComboboxContextValue>(
  null as any
);

export const defaultFilter: FilterFn = (
  { group, keywords = [], label, value },
  search
) => {
  const uniqueTerms = new Set(
    [value, ...keywords, group, label].filter(Boolean)
  );

  return Array.from(uniqueTerms).some((keyword) =>
    filterWords(keyword!, search)
  );
};

interface InlineComboboxProps {
  children: ReactNode;
  element: TElement;
  trigger: string;
  filter?: FilterFn | false;
  hideWhenNoValue?: boolean;
  showTrigger?: boolean;
  value?: string;
  setValue?: (value: string) => void;
}

const InlineCombobox = ({
  children,
  element,
  filter = defaultFilter,
  hideWhenNoValue = false,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: InlineComboboxProps) => {
  const editor = useEditorRef();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);

  const [valueState, setValueState] = useState('');
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;

  const setValue = useCallback(
    (newValue: string) => {
      setValueProp?.(newValue);

      if (!hasValueProp) {
        setValueState(newValue);
      }
    },
    [setValueProp, hasValueProp]
  );

  const [insertPoint, setInsertPoint] = useState<PointRef | null>(null);

  useEffect(() => {
    const path = editor.api.findPath(element);

    if (!path) return;

    const point = editor.api.before(path);

    if (!point) return;

    const pointRef = editor.api.pointRef(point);
    setInsertPoint(pointRef);

    return () => {
      pointRef.unref();
    };
  }, [editor, element]);

  const { props: inputProps, removeInput } = useComboboxInput({
    cancelInputOnBlur: false,
    cursorState,
    ref: inputRef,
    onCancelInput: (cause) => {
      if (cause !== 'backspace') {
        editor.tf.insertText(trigger + value, {
          at: insertPoint?.current ?? undefined,
        });
      }
      if (cause === 'arrowLeft' || cause === 'arrowRight') {
        editor.tf.move({
          distance: 1,
          reverse: cause === 'arrowLeft',
        });
      }
    },
  });

  const [hasEmpty, setHasEmpty] = useState(false);

  const contextValue: InlineComboboxContextValue = useMemo(
    () => ({
      filter,
      inputProps,
      inputRef,
      removeInput,
      setHasEmpty,
      showTrigger,
      trigger,
    }),
    [
      trigger,
      showTrigger,
      filter,
      inputRef,
      inputProps,
      removeInput,
      setHasEmpty,
    ]
  );

  const store = Ariakit.useComboboxStore({
    setValue: (newValue) => startTransition(() => setValue(newValue)),
  });

  const items = store.useState('items');

  useEffect(() => {
    if (!store.getState().activeId) {
      store.setActiveId(store.first());
    }
  }, [items, store]);

  return (
    <span contentEditable={false}>
      <Ariakit.ComboboxProvider
        open={
          (items.length > 0 || hasEmpty) &&
          (!hideWhenNoValue || value.length > 0)
        }
        store={store}
      >
        <InlineComboboxContext.Provider value={contextValue}>
          {children}
        </InlineComboboxContext.Provider>
      </Ariakit.ComboboxProvider>
    </span>
  );
};

function InlineComboboxInput({
  className,
  ref: refProp,
  ...props
}: React.ComponentProps<'input'>) {
  const {
    inputProps,
    inputRef: contextRef,
    showTrigger,
    trigger,
  } = useContext(InlineComboboxContext);

  const store = Ariakit.useComboboxContext()!;
  const value = store.useState('value');

  const ref = useComposedRef(refProp, contextRef);

  return (
    <>
      {showTrigger && trigger}

      <span className="relative min-h-[1lh]">
        <span
          className="invisible overflow-hidden text-nowrap"
          aria-hidden="true"
        >
          {value || '\u200B'}
        </span>

        <Ariakit.Combobox
          ref={ref}
          className={cn(
            'absolute top-0 left-0 size-full bg-transparent outline-hidden',
            className
          )}
          value={value}
          autoSelect
          {...inputProps}
          {...props}
        />
      </span>
    </>
  );
}

const comboboxVariants = cva(
  'z-500 mt-1 h-full min-w-[180px] max-w-[calc(100vw-24px)] animate-popover rounded-lg bg-popover shadow-floating',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: '',
        emoji: 'max-h-[270px] w-[408px]',
        mention: 'w-[400px]',
        slash: 'w-[340px] bg-white',
      },
    },
  }
);

const InlineComboboxContent = ({
  className,
  variant,
  ...props
}: Ariakit.ComboboxPopoverProps & VariantProps<typeof comboboxVariants>) => {
  return (
    <Ariakit.Portal>
      <style global jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          position: relative;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }

        .scrollable-content {
          position: relative;
        }

        .custom-scrollbar::before,
        .custom-scrollbar::after {
          content: '';
          position: absolute;
          left: 0;
          right: 6px; /* Space for scrollbar */
          height: 20px;
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .custom-scrollbar::before {
          top: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 1) 30%,
            rgba(255, 255, 255, 0)
          );
        }

        .custom-scrollbar::after {
          bottom: 0;
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 1) 30%,
            rgba(255, 255, 255, 0)
          );
        }

        .custom-scrollbar.show-top-shadow::before {
          opacity: 0.8;
        }

        .custom-scrollbar.show-bottom-shadow::after {
          opacity: 0.8;
        }
      `}</style>
      <Ariakit.ComboboxPopover
        className={cn(comboboxVariants({ variant }), className)}
        {...props}
      >
        {props.children}
      </Ariakit.ComboboxPopover>
    </Ariakit.Portal>
  );
};

const comboboxItemVariants = cva(
  'relative flex select-none items-center rounded-md px-3 py-2 text-sm text-foreground outline-hidden transition-all duration-200 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    defaultVariants: {
      interactive: true,
    },
    variants: {
      interactive: {
        false: '',
        true: 'cursor-pointer hover:bg-gray-100 data-[active-item=true]:bg-gray-100',
      },
    },
  }
);

export type InlineComboboxItemProps = {
  focusEditor?: boolean;
  group?: string;
  keywords?: string[];
  label?: string;
} & Ariakit.ComboboxItemProps &
  Required<Pick<Ariakit.ComboboxItemProps, 'value'>>;

const InlineComboboxItem = ({
  className,
  focusEditor = true,
  group,
  keywords,
  label,
  onClick,
  ...props
}: InlineComboboxItemProps) => {
  const { value } = props;

  const { filter, removeInput } = useContext(InlineComboboxContext);

  const store = Ariakit.useComboboxContext()!;

  const search = filter && store.useState('value');

  const visible = useMemo(
    () =>
      !filter || filter({ group, keywords, label, value }, search as string),
    [filter, group, keywords, value, label, search]
  );

  if (!visible) return null;

  return (
    <Ariakit.ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      onClick={(event) => {
        removeInput(focusEditor);
        onClick?.(event);
      }}
      {...props}
    />
  );
};

const InlineComboboxEmpty = ({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) => {
  const { setHasEmpty } = useContext(InlineComboboxContext);
  const store = Ariakit.useComboboxContext()!;
  const items = store.useState('items');

  useEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (items.length > 0) return null;

  return (
    <div
      className={cn(
        comboboxItemVariants({ interactive: false }),
        'my-1.5 text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
};

const InlineComboboxRow = Ariakit.ComboboxRow;
const InlineComboboxGroup = withCn(
  Ariakit.ComboboxGroup,
  'hidden py-1.5 [&:has([role=option])]:block not-last:border-b'
);

const InlineComboboxGroupLabel = withCn(
  Ariakit.ComboboxGroupLabel,
  'mb-1 mt-1 px-3 text-xs font-medium uppercase tracking-wide text-gray-500'
);

export {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
  InlineComboboxRow,
};
