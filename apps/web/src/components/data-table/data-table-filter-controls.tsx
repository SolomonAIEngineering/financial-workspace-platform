'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/registry/default/potion-ui/accordion';

import { DataTableFilterCheckbox } from './data-table-filter-checkbox';
import type { DataTableFilterField } from './types';
import { DataTableFilterInput } from './data-table-filter-input';
import { DataTableFilterResetButton } from './data-table-filter-reset-button';
import { DataTableFilterSlider } from './data-table-filter-slider';
import { DataTableFilterTimerange } from './data-table-filter-timerange';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { useDataTable } from '@/components/data-table/data-table-provider';

// FIXME: use @container (especially for the slider element) to restructure elements

// TODO: only pass the columns to generate the filters!
// https://tanstack.com/table/v8/docs/framework/react/examples/filters

// Group filters by type or category
const groupFilters = <TData,>(filterFields: DataTableFilterField<TData>[]) => {
  const groups: {
    timerange: DataTableFilterField<TData>[];
    numeric: DataTableFilterField<TData>[];
    selection: DataTableFilterField<TData>[];
    text: DataTableFilterField<TData>[];
    other: DataTableFilterField<TData>[];
  } = {
    timerange: [],
    numeric: [],
    selection: [],
    text: [],
    other: [],
  };

  // Group filters by their type
  filterFields?.forEach((field) => {
    switch (field.type) {
      case 'timerange':
        groups.timerange.push(field);
        break;
      case 'slider':
        groups.numeric.push(field);
        break;
      case 'checkbox':
        groups.selection.push(field);
        break;
      case 'input':
        groups.text.push(field);
        break;
      default:
        groups.other.push(field);
    }
  });

  return groups;
};

export function DataTableFilterControls() {
  const { filterFields } = useDataTable();

  // Group filters by type for better organization
  const filterGroups = groupFilters(filterFields);

  // Flatten groups but add a visual divider between groups
  const orderedFilters = [
    ...filterGroups.timerange,
    ...filterGroups.numeric,
    ...filterGroups.selection,
    ...filterGroups.text,
    ...filterGroups.other,
  ];

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        defaultValue={filterFields
          ?.filter(({ defaultOpen }) => defaultOpen)
          ?.map(({ value }) => value as string)}
        className="space-y-1"
      >
        {orderedFilters.map((field, index) => {
          const value = field.value as string;
          const isTimerange = field.type === 'timerange';
          const isNewGroup =
            index > 0 && orderedFilters[index - 1]?.type !== field.type;

          let filterComponent;
          switch (field.type) {
            case 'checkbox': {
              filterComponent = <DataTableFilterCheckbox {...field} />;
              break;
            }
            case 'slider': {
              filterComponent = <DataTableFilterSlider {...field} />;
              break;
            }
            case 'input': {
              filterComponent = <DataTableFilterInput {...field} />;
              break;
            }
            case 'timerange': {
              filterComponent = <DataTableFilterTimerange {...field} />;
              break;
            }
            default:
              filterComponent = null;
          }

          return (
            <Fragment key={value}>
              {isNewGroup && (
                <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
              )}
              <AccordionItem
                value={value}
                className={cn(
                  'overflow-hidden rounded-md border-none',
                  isTimerange && 'bg-gray-50/50 dark:bg-gray-800/20'
                )}
              >
                <AccordionTrigger className="w-full px-2 py-0 hover:no-underline data-[state=closed]:text-muted-foreground focus-within:data-[state=closed]:text-foreground hover:data-[state=closed]:text-foreground data-[state=open]:text-foreground">
                  <div className="flex w-full items-center justify-between gap-2 truncate py-2 pr-2">
                    <div className="flex items-center gap-2 truncate">
                      <p className="text-sm font-medium">{field.label}</p>
                      {value !== field.label.toLowerCase() &&
                      !field.commandDisabled ? (
                        <p className="mt-px truncate font-mono text-[10px] text-muted-foreground">
                          {value}
                        </p>
                      ) : null}
                    </div>
                    <DataTableFilterResetButton {...field} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="transition-all">
                  <div className="rounded-md p-2">{filterComponent}</div>
                </AccordionContent>
              </AccordionItem>
            </Fragment>
          );
        })}
      </Accordion>
    </div>
  );
}
