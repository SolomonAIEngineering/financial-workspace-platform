import { LoaderCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/registry/default/potion-ui/button";
import { useDataTable } from "@/components/data-table/data-table-provider";

interface RefreshButtonProps {
  onClick: () => void;
}

export function RefreshButton({ onClick }: RefreshButtonProps) {
  const { isLoading } = useDataTable();

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isLoading}
      onClick={onClick}
      className="h-9 w-9"
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCcw className="h-4 w-4" />
      )}
    </Button>
  );
}
