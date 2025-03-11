'use client'

import {
  FinancialUserProfile,
  MelodyFinancialContext,
  Transaction,
} from 'client-typescript-sdk'
import { Card, CardContent, CardHeader } from '../card'
import { Dialog, DialogContent, DialogTrigger } from '../dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'
import { DataTable, columns } from '../transaction-table'

import { ArrowRightIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { BankAccount } from 'solomon-ai-typescript-sdk'
import { FinancialDataGenerator } from '../../lib/random/financial-data-generator'
import { cn } from '../../utils/cn'
import { Button } from '../button'
import { BankAccountCard } from '../cards/bank-account-card'

interface BankAccountPortalViewProps {
  financialProfile?: FinancialUserProfile
  financialContext?: MelodyFinancialContext
  className?: string
  transactions?: Transaction[]
  demoMode?: boolean
}

/**
 * BankAccountsOverviewSummary component displays an overview of all bank accounts.
 * It shows a header with the total count of bank accounts and a list of bank account cards.
 *
 * @param props - The props for the component.
 * @returns A React functional component.
 */
const BankAccountsOverviewSummary: React.FC<BankAccountPortalViewProps> = ({
  financialProfile,
  financialContext,
  className,
  transactions,
  demoMode = false,
}) => {
  if (!financialProfile || !financialContext || demoMode) {
    financialProfile = FinancialDataGenerator.generateFinancialProfile()
    financialContext = FinancialDataGenerator.generateFinancialContext()
    transactions = FinancialDataGenerator.generateRandomTransactions(50)
  }

  // get the current financial profile
  const linkedInstitutions =
    financialProfile.link !== undefined ? financialProfile.link : []

  // get all bank accounts from link
  let bankAccounts = linkedInstitutions
    ? linkedInstitutions
        .filter((link) => link.bankAccounts !== undefined)
        .map((link) => link.bankAccounts)
        .flat()
    : []

  const validAccounts: Array<BankAccount> = bankAccounts.filter(
    (account) => account !== undefined,
  )

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (validAccounts.length === 0) {
    return (
      <Card className="p-[2%]">
        <CardHeader>
          <h3 className="text-3xl font-bold">Bank Accounts</h3>
        </CardHeader>
        <CardContent>
          <p>No bank accounts connected.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={cn('bg-background text-foreground h-screen w-full', className)}
    >
      <Card className="flex h-full flex-col p-[2%]">
        <h3 className="mb-4 text-3xl font-bold">Bank Accounts</h3>
        <div className="flex-grow overflow-hidden">
          <Tabs
            defaultValue={validAccounts[0]?.name as string}
            className="flex h-full"
          >
            <TabsList className="scrollbar-hide mr-4 h-[40%] w-fit flex-col items-start justify-start overflow-y-auto rounded-2xl bg-black p-[1%] text-white">
              {validAccounts.map((account, idx) => (
                <TabsTrigger
                  value={account.name as string}
                  key={idx}
                  className="mb-2 w-full rounded-2xl text-left text-xs font-bold text-white"
                >
                  <div className="flex flex-col items-start justify-start gap-1 rounded-2xl">
                    <p className="w-full text-left text-xs font-bold">
                      {account.name}
                    </p>
                    <span style={{ fontSize: '0.5rem' }}>{account.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            <Card className="scrollbar-hide w-full overflow-y-auto">
              {validAccounts.map((account, idx) => (
                <TabsContent
                  value={account.name as string}
                  key={idx}
                  className="px-4"
                >
                  <BankAccountCard
                    bankAccount={account}
                    className="bg-background text-foreground border-none shadow-none"
                    financialProfile={financialProfile}
                    enableDemoMode={demoMode}
                  />
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="mt-4 px-4 py-2" variant="outline">
                        View Transactions
                        <ArrowRightIcon className="ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="scrollbar-hide h-[80%] w-full min-w-[90%] overflow-y-auto rounded-2xl p-[2%]">
                      <h2 className="pt-6 text-lg font-bold tracking-tight">
                        {account.name?.toUpperCase()}{' '}
                        <span className="ml-1 text-xs"> {account.number}</span>
                      </h2>
                      <p className="pb-5 text-4xl font-bold tracking-tight">
                        ${account.balance.toFixed(2)}{' '}
                        <span className="ml-1 text-xs"> {account.subtype}</span>
                      </p>
                      {transactions && (
                        <div className="flex flex-col gap-3 p-[2%]">
                          <h2 className="ml-5 text-3xl font-bold tracking-tight">
                            Most Recent Transactions{' '}
                            <span className="ml-1 text-xs">
                              ({transactions.length}){' '}
                            </span>
                          </h2>
                          <DataTable data={transactions} columns={columns} />
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TabsContent>
              ))}
            </Card>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}

export { BankAccountsOverviewSummary }
