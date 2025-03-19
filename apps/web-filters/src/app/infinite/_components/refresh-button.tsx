import { useDataTable } from "@/components/data-table/data-table-provider";
import { Button } from "@/components/ui/button";

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
        <span className="h-4 w-4 animate-spin">⟳</span>
      ) : (
        <span className="h-4 w-4">↻</span>
      )}
    </Button>
  );
}
