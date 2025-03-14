import { TableCell, TableRow } from '@/registry/default/potion-ui/table';

import { LevelIndicator } from './level-indicator';
import { columns } from '../columns';

export function LiveRow() {
  return (
    <TableRow>
      <TableCell className="w-[--header-level-size] max-w-[--header-level-size] min-w-[--header-level-size] border-t border-r border-b border-l border-gray-300 border-r-gray-300/50">
        <LevelIndicator level="info" />
      </TableCell>
      <TableCell
        colSpan={columns.length - 1}
        className="text-info border-t border-r border-b border-gray-300 font-medium"
      >
        Live Mode
      </TableCell>
    </TableRow>
  );
}
