import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import type { Template } from '../../types'

type Props = {
  template: Template
  invoiceNumber: string
  issueDate: string
  dueDate: string
  timezone: string
}

export function Meta({
  template,
  invoiceNumber,
  issueDate,
  dueDate,
  timezone,
}: Props) {
  return (
    <div className="mb-2">
      <h2 className="mb-1 w-fit min-w-[100px] font-mono text-[21px] font-medium">
        {template.title}
      </h2>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center space-x-1">
          <div className="flex flex-shrink-0 items-center space-x-1">
            <span className="truncate font-mono text-[11px] text-[#878787]">
              {template.invoice_no_label}:
            </span>
            <span className="flex-shrink-0 font-mono text-[11px]">
              {invoiceNumber}
            </span>
          </div>
        </div>

        <div>
          <div>
            <div className="flex items-center space-x-1">
              <div className="flex flex-shrink-0 items-center space-x-1">
                <span className="truncate font-mono text-[11px] text-[#878787]">
                  {template.issue_date_label}:
                </span>
                <span className="flex-shrink-0 font-mono text-[11px]">
                  {format(
                    new TZDate(issueDate, timezone),
                    template.date_format,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div className="flex items-center space-x-1">
              <div className="flex flex-shrink-0 items-center space-x-1">
                <span className="truncate font-mono text-[11px] text-[#878787]">
                  {template.due_date_label}:
                </span>
                <span className="flex-shrink-0 font-mono text-[11px]">
                  {format(new TZDate(dueDate, timezone), template.date_format)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
