import type { Meta, StoryObj } from '@storybook/react';
import { Meta as MetaComponent } from './meta';

// Full template with all required properties
const defaultTemplate = {
    title: "Invoice",
    invoice_no_label: "Invoice No",
    issue_date_label: "Issue Date",
    due_date_label: "Due Date",
    date_format: "MMMM dd, yyyy",
    timezone: "UTC",
    from_label: "From",
    customer_label: "Customer",
    payment_label: "Payment",
    note_label: "Note",
    description_label: "Description",
    quantity_label: "Quantity",
    price_label: "Price",
    total_label: "Total",
    total_summary_label: "Total",
    tax_label: "Tax",
    vat_label: "VAT",
    tax_rate: 0,
    vat_rate: 0,
    locale: "en-US",
    discount_label: "Discount",
    include_discount: false,
    include_tax: false,
    include_decimals: true,
    include_units: false,
    include_qr: false,
    include_vat: false,
    subtotal_label: "Subtotal",
    subtotal: 0
};

const meta = {
    title: 'Templates/HTML/Components/Meta',
    component: MetaComponent,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof MetaComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        template: defaultTemplate,
        invoiceNumber: "INV-001",
        issueDate: "2023-06-01T00:00:00Z",
        dueDate: "2023-06-15T00:00:00Z",
        timezone: "UTC",
    },
};

export const DifferentDateFormat: Story = {
    args: {
        template: {
            ...defaultTemplate,
            date_format: "MM/dd/yyyy",
        },
        invoiceNumber: "INV-001",
        issueDate: "2023-06-01T00:00:00Z",
        dueDate: "2023-06-15T00:00:00Z",
        timezone: "UTC",
    },
};

export const Receipt: Story = {
    args: {
        template: {
            ...defaultTemplate,
            title: "Receipt",
            invoice_no_label: "Receipt No",
        },
        invoiceNumber: "REC-001",
        issueDate: "2023-06-01T00:00:00Z",
        dueDate: "2023-06-15T00:00:00Z",
        timezone: "UTC",
    },
}; 