import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Editor } from './index';

const meta = {
    title: 'Components/Editor',
    component: Editor,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        placeholder: 'Start typing...',
        onUpdate: fn(),
        onBlur: fn(),
        onFocus: fn(),
        className: 'w-full max-w-[800px] border border-border rounded-md p-4 min-h-[200px]',
    },
    argTypes: {
        initialContent: { control: 'text' },
        placeholder: { control: 'text' },
    },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const WithContent: Story = {
    args: {
        initialContent: '<p>Here is some initial content for the editor.</p><p>It supports <strong>bold</strong>, <em>italic</em>, and <s>strikethrough</s> formatting.</p>',
    },
};

export const WithPlaceholder: Story = {
    args: {
        placeholder: 'Write something amazing...',
    },
};

export const CustomStyling: Story = {
    args: {
        className: 'w-full max-w-[600px] border-2 border-blue-400 rounded-lg p-6 min-h-[300px] bg-gray-50',
        placeholder: 'Custom styled editor...',
    },
}; 