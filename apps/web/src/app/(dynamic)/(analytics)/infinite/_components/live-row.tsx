import { TableCell, TableRow } from "@/registry/default/potion-ui/table";

import { LevelIndicator } from "./level-indicator";
import { columns } from "../columns";

export function LiveRow() {
  return (
    <TableRow>
      <TableCell className="w-[--header-level-size] min-w-[--header-level-size] max-w-[--header-level-size] border-b border-l border-r border-t border-gray-300 border-r-gray-300/50">
        <LevelIndicator level="info" />
      </TableCell>
      <TableCell
        colSpan={columns.length - 1}
        className="border-b border-r border-t border-gray-300 font-medium text-info"
      >
        Live Mode
      </TableCell>
    </TableRow>
  );
}
