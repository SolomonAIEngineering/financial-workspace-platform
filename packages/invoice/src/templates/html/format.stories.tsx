import type { Meta, StoryObj } from '@storybook/react'
import { EditorDoc, TemplateProps } from '../types'
import { HtmlTemplate } from './index'

const meta = {
  title: 'Templates/HTML/Format',
  component: HtmlTemplate,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'This story demonstrates the HTML formatting function which converts editor content to HTML elements',
      },
    },
  },
} satisfies Meta<typeof HtmlTemplate>

export default meta
type Story = StoryObj<typeof meta>

// Mock data for the template
const mockEditorDoc: EditorDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Sample content',
        },
      ],
    },
  ],
}

// Mock template props
const mockTemplateProps: TemplateProps = {
  title: 'Invoice',
  invoice_number: 'INV-001',
  issue_date: '2023-06-01',
  due_date: '2023-06-15',
  template: {
    logo_url: 'https://via.placeholder.com/150',
    from_label: 'From',
    customer_label: 'Bill To',
    invoice_no_label: 'Invoice No',
    issue_date_label: 'Issue Date',
    due_date_label: 'Due Date',
    date_format: 'MMMM DD, YYYY',
    payment_label: 'Payment Details',
    note_label: 'Notes',
    description_label: 'Description',
    quantity_label: 'Qty',
    price_label: 'Price',
    total_label: 'Total',
    total_summary_label: 'Total Due',
    tax_label: 'Tax',
    vat_label: 'VAT',
    tax_rate: 10,
    vat_rate: 5,
    locale: 'en-US',
    discount_label: 'Discount',
    include_discount: true,
    include_tax: true,
    timezone: 'UTC',
    include_decimals: true,
    include_units: true,
    include_qr: true,
    include_vat: true,
    title: 'Invoice',
    subtotal_label: 'Subtotal',
    subtotal: 0,
  },
  line_items: [
    {
      name: 'Professional Services',
      quantity: 10,
      price: 100,
      unit: 'hours',
    },
    {
      name: 'Software License',
      quantity: 1,
      price: 499,
      unit: 'license',
    },
  ],
  customer_details: mockEditorDoc as any,
  payment_details: mockEditorDoc as any,
  from_details: mockEditorDoc as any,
  note_details: mockEditorDoc as any,
  currency: 'USD',
  amount: 1499,
  customer_name: 'Acme Inc.',
  discount: 10,
  width: 800,
  height: 1100,
  token: 'sample-token',
  size: 'letter' as 'letter' | 'a4',
  top_block: mockEditorDoc as any,
  bottom_block: mockEditorDoc as any,
  subtotal: 1499,
}

export const FormatHtml: Story = {
  args: mockTemplateProps,
  parameters: {
    docs: {
      source: {
        code: `
// Example usage of formatEditorContent function
import { formatEditorContent } from './format';

// With editor document
const htmlElement = formatEditorContent(editorDoc);
`,
      },
    },
  },
  render: () => {
    // This is just for display purposes in Storybook
    // In a real scenario, formatEditorContent would return HTML elements
    // which would be used in the invoice
    return <HtmlTemplate {...mockTemplateProps} />
  },
}
