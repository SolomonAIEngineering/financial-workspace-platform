import { format, parseISO } from 'date-fns'

import type { Template } from '../../types'

type Props = {
  template: Template
  invoiceNumber: string
  issueDate: string
  dueDate: string
}

export function Meta({ template, invoiceNumber, issueDate, dueDate }: Props) {
  return (
    <div className="mb-2 mt-14 flex items-center justify-between">
      <div className="flex items-center">
        <span className="mr-2 font-mono text-[22px] text-[#878787]">
          {template.invoice_no_label}:
        </span>
        <span className="font-mono text-[22px] text-white">
          {invoiceNumber}
        </span>
      </div>

      <div className="flex items-center">
        <span className="mr-2 font-mono text-[22px] text-[#878787]">
          {template.issue_date_label}:
        </span>
        <span className="font-mono text-[22px] text-white">
          {format(parseISO(dueDate), template.date_format)}

        </span>
      </div>

      <div className="flex items-center">
        <span className="mr-2 font-mono text-[22px] text-[#878787]">
          {template.due_date_label}:
        </span>
        <span className="font-mono text-[22px] text-white">
          {format(parseISO(dueDate), template.date_format)}
        </span>
      </div>
    </div>
  )
}
