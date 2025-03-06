/**
 * Bank Account Management Tabs
 *
 * This component provides a tabbed interface for managing all bank account
 * related functionalities including connections, accounts, transactions, and
 * settings.
 */

'use client';

import { useState } from 'react';

import { Icons } from '@/components/ui/icons';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/registry/default/potion-ui/tabs';

import { BankConnections } from './bank-connections';
import { BankAccountsList } from './tabs/bank-accounts-tab';
import { BankSettings } from './tabs/bank-settings-tab';
import { BankTransactions } from './tabs/bank-transactions-tab';

interface BankAccountTabsProps {
  userId: string;
}

export function BankAccountTabs({ userId }: BankAccountTabsProps) {
  const [activeTab, setActiveTab] = useState('connections');

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Bank Account Management
        </h2>
        <p className="mt-1 text-muted-foreground">
          Manage your bank connections, accounts, and transactions
        </p>
      </div>

      <Tabs
        className="w-full"
        defaultValue="connections"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6 grid w-full grid-cols-4 bg-muted/20">
          <TabsTrigger
            className="flex items-center gap-2 data-[state=active]:bg-background"
            value="connections"
          >
            <Icons.link className="size-4" />
            <span>Connections</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2 data-[state=active]:bg-background"
            value="accounts"
          >
            <Icons.creditCard className="size-4" />
            <span>Accounts</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2 data-[state=active]:bg-background"
            value="transactions"
          >
            <Icons.arrowLeftRight className="size-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2 data-[state=active]:bg-background"
            value="settings"
          >
            <Icons.settings className="size-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
          value="connections"
        >
          <BankConnections userId={userId} />
        </TabsContent>

        <TabsContent
          className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
          value="accounts"
        >
          <BankAccountsList userId={userId} />
        </TabsContent>

        <TabsContent
          className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
          value="transactions"
        >
          <BankTransactions userId={userId} />
        </TabsContent>

        <TabsContent
          className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
          value="settings"
        >
          <BankSettings userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
