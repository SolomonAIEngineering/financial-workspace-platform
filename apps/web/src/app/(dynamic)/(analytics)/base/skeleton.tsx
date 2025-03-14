import { Skeleton as UISkeleton } from "@/components/ui/skeleton";

export function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <UISkeleton className="h-8 w-[250px]" />
          <UISkeleton className="h-4 w-[350px]" />
        </div>
        <div className="flex items-center gap-2">
          <UISkeleton className="h-9 w-[120px]" />
          <UISkeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <UISkeleton className="h-4 w-[150px]" />
            <UISkeleton className="h-4 w-4" />
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <UISkeleton className="h-6 w-[200px]" />
                <UISkeleton className="h-6 w-[150px]" />
                <UISkeleton className="h-6 w-[100px]" />
                <UISkeleton className="h-6 w-[120px]" />
                <UISkeleton className="h-6 w-[100px]" />
                <UISkeleton className="h-6 w-[80px]" />
                <UISkeleton className="h-6 w-[60px]" />
                <UISkeleton className="h-6 w-[120px]" />
                <UISkeleton className="h-6 w-[100px]" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t p-4">
          <UISkeleton className="h-9 w-[250px]" />
          <UISkeleton className="h-9 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
