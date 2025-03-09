import { TableCell, TableRow } from "@/components/custom/table";
import { columns } from "../columns";
import { LevelIndicator } from "./level-indicator";

export function LiveRow() {
  return (
    <TableRow>
      <TableCell className="w-[--header-level-size] min-w-[--header-level-size] max-w-[--header-level-size] border-b border-l border-r border-t border-info border-r-info/50">
        <LevelIndicator level="info" />
      </TableCell>
      <TableCell
        colSpan={columns.length - 1}
        className="border-b border-r border-t border-info font-medium text-info"
      >
        Live Mode
      </TableCell>
    </TableRow>
  );
}
