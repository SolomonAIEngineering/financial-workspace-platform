import { Avatar } from './avatar'
import { Status } from './status'

type Props = {
  customerName: string
  status: 'draft' | 'overdue' | 'paid' | 'unpaid' | 'canceled'
  logoUrl?: string
  isValidLogo: boolean
}

export function Header({ customerName, status, logoUrl, isValidLogo }: Props) {
  return (
    <div className="mb-12 flex w-full items-center justify-between">
      <Avatar
        logoUrl={logoUrl}
        isValidLogo={isValidLogo}
        customerName={customerName}
      />
      <Status status={status} />
    </div>
  )
}
