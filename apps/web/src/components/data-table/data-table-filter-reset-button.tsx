'use client';

import { Button } from '@/registry/default/potion-ui/button';
import type { DataTableFilterField } from './types';
import { X } from 'lucide-react';
import { useDataTable } from '@/components/data-table/data-table-provider';

export function DataTableFilterResetButton<TData>({
  value: _value,
}: DataTableFilterField<TData>) {
  const { columnFilters, table } = useDataTable();
  const value = _value as string;
  const column = table.getColumn(value);
  const filterValue = columnFilters.find((f) => f.id === value)?.value;

  // TODO: check if we could useMemo
  const filters = filterValue
    ? Array.isArray(filterValue)
      ? filterValue
      : [filterValue]
    : [];

  if (filters.length === 0) return null;

  return (
    <Button
      type="button"
      variant="outline"
      className="h-5 rounded-full px-1.5 py-1 font-mono text-[10px]"
      onClick={(e) => {
        e.stopPropagation();
        column?.setFilterValue(undefined);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.code === 'Enter') {
          column?.setFilterValue(undefined);
        }
      }}
    >
      <span>{filters.length}</span>
      <X className="ml-1 h-2.5 w-2.5 text-muted-foreground" />
    </Button>
  );
}
