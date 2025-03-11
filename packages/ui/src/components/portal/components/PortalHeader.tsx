import React from 'react'

interface PortalHeaderProps {
  linkedInstitutionsCount: number
  numConnectedAccounts: number
  title?: string
  description?: string
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  linkedInstitutionsCount,
  numConnectedAccounts,
  title = 'Financial Portal',
  description = 'Your Premier Gateway to Wealth Mastery and Financial Liberation.',
}) => (
  <>
    <div className="flex flex-row justify-between">
      <p className="text-base font-semibold leading-7 text-blue-600 md:pt-[5%]">
        Solomon AI
      </p>
    </div>
    <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
      {title}
      <span className="font-base ml-4 text-sm">
        {linkedInstitutionsCount} Linked{' '}
        {linkedInstitutionsCount === 1 ? 'Account' : 'Accounts'}
      </span>
    </h2>
    <p className="text-foreground/3 mt-6 text-lg leading-8">{description}</p>
    <div>
      <h2 className="py-5 text-2xl font-bold tracking-tight">
        Overview{' '}
        <span className="ml-1 text-xs">
          {numConnectedAccounts}{' '}
          {numConnectedAccounts === 1 ? 'Account' : 'Accounts'}
        </span>
      </h2>
    </div>
  </>
)
