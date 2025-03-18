import type { Meta, StoryObj } from '@storybook/react';
import { PaymentDetails } from './payment-details';

const meta = {
    title: 'Templates/PDF/Components/PaymentDetails',
    component: PaymentDetails,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof PaymentDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        paymentLabel: "Payment Details",
        content: {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Bank: ABC Bank"
                        }
                    ]
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Account: 1234567890"
                        }
                    ]
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Reference: INV-001"
                        }
                    ]
                }
            ]
        } as unknown as JSON,
    },
}; 