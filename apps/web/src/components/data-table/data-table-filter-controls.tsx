'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/registry/default/potion-ui/accordion';

import { DataTableFilterCheckbox } from './data-table-filter-checkbox';
import { DataTableFilterInput } from './data-table-filter-input';
import { DataTableFilterResetButton } from './data-table-filter-reset-button';
import { DataTableFilterSlider } from './data-table-filter-slider';
import { DataTableFilterTimerange } from './data-table-filter-timerange';
import type React from 'react';
import { useDataTable } from '@/components/data-table/data-table-provider';

// FIXME: use @container (especially for the slider element) to restructure elements

// TODO: only pass the columns to generate the filters!
// https://tanstack.com/table/v8/docs/framework/react/examples/filters

export function DataTableFilterControls() {
  const { filterFields } = useDataTable();
  return (
    <Accordion
      type="multiple"
      defaultValue={filterFields
        ?.filter(({ defaultOpen }) => defaultOpen)
        ?.map(({ value }) => value as string)}
    >
      {filterFields?.map((field) => {
        const value = field.value as string;

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
          <AccordionItem key={value} value={value} className="border-none">
            <AccordionTrigger className="w-full px-2 py-0 hover:no-underline data-[state=closed]:text-muted-foreground focus-within:data-[state=closed]:text-foreground hover:data-[state=closed]:text-foreground data-[state=open]:text-foreground">
              <div className="flex w-full items-center justify-between gap-2 truncate py-2 pr-2">
                <div className="flex items-center gap-2 truncate">
                  <p className="text-sm font-medium">{field.label}</p>
                  {value !== field.label.toLowerCase() && !field.commandDisabled ? (
                    <p className="mt-px truncate font-mono text-[10px] text-muted-foreground">
                      {value}
                    </p>
                  ) : null}
                </div>
                <DataTableFilterResetButton {...field} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-1">
                {filterComponent}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

