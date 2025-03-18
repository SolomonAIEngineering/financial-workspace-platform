import type { Meta, StoryObj } from '@storybook/react';
import { Meta as MetaComponent } from './meta';

const meta = {
    title: 'Templates/PDF/Components/Meta',
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
        invoiceNo: "INV-001",
        issueDate: "2023-06-01T00:00:00Z",
        dueDate: "2023-06-15T00:00:00Z",
        invoiceNoLabel: "Invoice No",
        issueDateLabel: "Issue Date",
        dueDateLabel: "Due Date",
        dateFormat: "MMMM dd, yyyy",
        timezone: "UTC",
        title: "Invoice",
    },
};

export const DifferentDateFormat: Story = {
    args: {
        ...Default.args,
        dateFormat: "MM/dd/yyyy",
    },
};

export const DifferentTitle: Story = {
    args: {
        ...Default.args,
        title: "Receipt",
    },
}; 