'use client';

import { Accordion, AccordionItem } from '@/components/ui/accordion';

import { BankAccountConnection } from './bank-connection';
import React from 'react';

/**
 * BankConnections Component
 *
 * Displays a list of bank connections, each expandable to show accounts.
 */
export function BankConnections({ data }: { data: any[] }) {
  const defaultValue = data.length === 1 ? ['connection-0'] : undefined;

  return (
    <div className="divide-y px-6">
      <Accordion type="multiple" className="w-full" defaultValue={defaultValue}>
        {data.map((connection, index) => (
          <AccordionItem
            value={`connection-${index}`}
            key={connection.id}
            className="border-none"
          >
            <BankAccountConnection connection={connection} />
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
