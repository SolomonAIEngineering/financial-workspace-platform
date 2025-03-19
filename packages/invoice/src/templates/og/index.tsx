import type { TemplateProps } from '../types'
import { EditorContent } from './components/editor-content'
import { Header } from './components/header'
import { Logo } from './components/logo'
import { Meta } from './components/meta'

type Props = TemplateProps & {
  isValidLogo: boolean
  name: string
  logoUrl: string
  status: 'draft' | 'overdue' | 'paid' | 'unpaid' | 'canceled'
}

export function OgTemplate({
  invoice_number,
  issue_date,
  due_date,
  template,
  customer_details,
  from_details,
  status,
  name,
  logoUrl,
  isValidLogo,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col bg-[#0C0C0C] p-16 py-8 font-[GeistMono]">
      <Header
        customerName={name}
        status={status}
        logoUrl={logoUrl}
        isValidLogo={isValidLogo}
      />

      <div className="flex flex-col">
        <Logo src={template.logo_url ?? ''} customerName={name} />
      </div>

      <Meta
        template={template}
        invoiceNumber={invoice_number}
        issueDate={issue_date}
        dueDate={due_date}
      />

      <div className="mt-10 flex justify-between">
        <div className="flex max-w-[50%] flex-1 flex-col">
          <span className="mb-1 font-[GeistMono] text-[22px] text-[#858585]">
            {template.from_label}
          </span>
          <EditorContent content={from_details} />
        </div>

        <div className="w-12" />

        <div className="flex max-w-[50%] flex-1 flex-col">
          <span className="mb-1 font-[GeistMono] text-[22px] text-[#858585]">
            {template.customer_label}
          </span>
          <EditorContent content={customer_details} />
        </div>
      </div>
    </div>
  )
}
