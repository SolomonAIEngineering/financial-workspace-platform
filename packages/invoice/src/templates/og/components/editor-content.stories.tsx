import type { Meta, StoryObj } from '@storybook/react';
import { EditorContent } from './editor-content';
import { EditorDoc } from '../../types';

const meta = {
    title: 'Templates/OG/Components/EditorContent',
    component: EditorContent,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof EditorContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        content: {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Sample editor content"
                        }
                    ]
                }
            ]
        } as unknown as JSON,
    },
};

export const WithMultipleParagraphs: Story = {
    args: {
        content: {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "First paragraph"
                        }
                    ]
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Second paragraph"
                        }
                    ]
                }
            ]
        } as unknown as JSON,
    },
}; 