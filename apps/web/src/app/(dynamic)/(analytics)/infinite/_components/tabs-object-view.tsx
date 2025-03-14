import { Braces, TableProperties } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/registry/default/potion-ui/tabs';

import CopyToClipboardContainer from '@/components/ui/copy-to-clipboard-container';
import { KeyValueTable } from './key-value-table';

interface TabsObjectViewProps {
  data: Record<string, string>;
  className?: string;
}

export function TabsObjectView({ data, className }: TabsObjectViewProps) {
  return (
    <Tabs defaultValue="table" className={className}>
      <div className="flex items-center justify-end">
        <TabsList className="h-auto gap-1 bg-background px-0 py-0">
          <TabsTrigger
            value="table"
            className="px-0 py-0 text-muted-foreground/70 data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <TableProperties className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="raw"
            className="px-0 py-0 text-muted-foreground/70 data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Braces className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="table" className="rounded-md">
        <KeyValueTable data={data} />
      </TabsContent>
      <TabsContent value="raw" asChild>
        {/* REMINDER: either `overflow-auto whitespace-pre` or `whitespace-pre-wrap` - depends if we want to wrap the text or not */}
        <CopyToClipboardContainer className="overflow-auto rounded-md border bg-muted/50 p-2 font-mono text-sm break-all whitespace-pre">
          {JSON.stringify(data, null, 2)}
        </CopyToClipboardContainer>
      </TabsContent>
    </Tabs>
  );
}
