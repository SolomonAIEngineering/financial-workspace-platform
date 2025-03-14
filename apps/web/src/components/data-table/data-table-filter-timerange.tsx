'use client';

import type { DataTableTimerangeFilterField } from './types';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import type { DateRange } from 'react-day-picker';
import { isArrayOfDates } from '@/lib/is-array';
import { useDataTable } from '@/components/data-table/data-table-provider';
import { useMemo } from 'react';

export function DataTableFilterTimerange<TData>({
  value: _value,
  presets,
}: DataTableTimerangeFilterField<TData>) {
  const value = _value as string;
  const { table, columnFilters } = useDataTable();
  const column = table.getColumn(value);
  const filterValue = columnFilters.find((i) => i.id === value)?.value;

  const date: DateRange | undefined = useMemo(() => {
    if (!filterValue) return undefined;

    if (filterValue instanceof Date) {
      return { from: filterValue, to: undefined };
    }

    if (Array.isArray(filterValue) && isArrayOfDates(filterValue)) {
      return {
        from: filterValue[0] || undefined,
        to: filterValue[1] || undefined,
      };
    }

    return undefined;
  }, [filterValue]);

  const setDate = (date: DateRange | undefined) => {
    if (!date || !date.from) {
      column?.setFilterValue(undefined);
      return;
    }

    if (date.from && !date.to) {
      column?.setFilterValue([date.from]);
    } else if (date.from && date.to) {
      column?.setFilterValue([date.from, date.to]);
    }
  };

  return (
    <div className="w-full">
      <DatePickerWithRange date={date} setDate={setDate} presets={presets} />
    </div>
  );
}
