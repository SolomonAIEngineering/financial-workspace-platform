import type { Meta, StoryObj } from '@storybook/react';
import { Note } from './note';

const meta = {
    title: 'Templates/PDF/Components/Note',
    component: Note,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Note>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        noteLabel: "Notes",
        content: {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Thank you for your business!"
                        }
                    ]
                }
            ]
        } as unknown as JSON,
    },
};

export const WithMultipleParagraphs: Story = {
    args: {
        noteLabel: "Notes",
        content: {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Thank you for your business!"
                        }
                    ]
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Please make payment within 30 days."
                        }
                    ]
                }
            ]
        } as unknown as JSON,
    },
}; 