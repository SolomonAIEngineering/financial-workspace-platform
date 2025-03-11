import React from 'react'

interface FreeTierViewProps {
  baseTierNumberOfConnectedAccounts: number
}

export const FreeTierView: React.FC<FreeTierViewProps> = ({
  baseTierNumberOfConnectedAccounts,
}) => (
  <div className="bg-background text-foreground">
    <div className="mx-auto w-full">
      <div className="flex flex-row justify-between">
        <p className="text-base font-semibold leading-7 text-blue-600 md:pt-[5%]">
          Solomon AI
        </p>
      </div>
      <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
        Financial Portal
        <span className="font-base ml-4 text-sm">
          {baseTierNumberOfConnectedAccounts} Linked Accounts
        </span>
      </h2>
      <p className="text-foreground/3 mt-6 text-lg leading-8">
        Your Premier Gateway to Wealth Mastery and Financial Liberation.
      </p>
      <div>
        <h2 className="py-5 text-2xl font-bold tracking-tight">
          Overview{' '}
          <span className="ml-1 text-xs">
            {baseTierNumberOfConnectedAccounts} Linked Accounts
          </span>
        </h2>
      </div>
    </div>
  </div>
)
