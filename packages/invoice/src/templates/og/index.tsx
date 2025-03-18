import { EditorContent } from "./components/editor-content";
import { Header } from "./components/header";
import { Logo } from "./components/logo";
import { Meta } from "./components/meta";
import React from 'react';
import type { TemplateProps } from "../types";

type Props = TemplateProps & {
  isValidLogo: boolean;
  name: string;
  logoUrl: string;
  status: "draft" | "overdue" | "paid" | "unpaid" | "canceled";
};

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
    <div className="h-full w-full flex flex-col bg-[#0C0C0C] font-[GeistMono] p-16 py-8">
      <Header
        customerName={name}
        status={status}
        logoUrl={logoUrl}
        isValidLogo={isValidLogo}
      />

      <div className="flex flex-col">
        <Logo src={template.logo_url ?? ""} customerName={name} />
      </div>

      <Meta
        template={template}
        invoiceNumber={invoice_number}
        issueDate={issue_date}
        dueDate={due_date}
      />

      <div className="flex justify-between mt-10">
        <div className="flex flex-col flex-1 max-w-[50%]">
          <span className="text-[#858585] text-[22px] font-[GeistMono] mb-1">
            {template.from_label}
          </span>
          <EditorContent content={from_details} />
        </div>

        <div className="w-12" />

        <div className="flex flex-col flex-1 max-w-[50%]">
          <span className="text-[#858585] text-[22px] font-[GeistMono] mb-1">
            {template.customer_label}
          </span>
          <EditorContent content={customer_details} />
        </div>
      </div>
    </div>
  );
}
