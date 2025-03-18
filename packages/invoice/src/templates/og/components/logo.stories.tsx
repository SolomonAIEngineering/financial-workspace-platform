import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './logo';

const meta = {
    title: 'Templates/OG/Components/Logo',
    component: Logo,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        src: 'https://placehold.co/112x112.png',
        customerName: 'Acme Inc.',
    },
};

export const SquareLogo: Story = {
    args: {
        src: 'https://placehold.co/112x112.png',
        customerName: 'Square Logo Company',
    },
};

export const RectangleLogo: Story = {
    args: {
        src: 'https://placehold.co/200x100.png',
        customerName: 'Rectangle Logo Company',
    },
}; 