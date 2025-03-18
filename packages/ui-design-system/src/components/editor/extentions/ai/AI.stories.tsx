import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '../../index';
import React from 'react';

// Simple demo component with a notice that AI features are disabled in Storybook
const AIEditorDemo = ({ initialContent, placeholder }: { initialContent?: string, placeholder?: string }) => {
    return (
        <div className="w-full max-w-[800px] border border-border rounded-md p-4">
            <div className="mb-4 space-y-2">
                <h3 className="font-medium">AI-Powered Editor</h3>
                <p className="text-sm text-gray-500">
                    Select text and then click the AI button in the bubble menu to access AI features.
                    <br />
                    <span className="block mt-1 text-xs text-amber-500 font-medium">
                        Note: AI features are disabled in Storybook. These work only in the actual application.
                    </span>
                </p>
            </div>
            <Editor
                initialContent={initialContent || '<p>Select this text and then click the AI button in the bubble menu to see AI options like Grammar Check, Improve, and Condense.</p><p>You can also type a custom prompt.</p><p>(Note: AI functionality is disabled in Storybook preview)</p>'}
                placeholder={placeholder}
                className="min-h-[200px]"
            />
        </div>
    );
};

const meta = {
    title: 'Components/Editor/AI Features',
    component: AIEditorDemo,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'This demonstrates the AI-powered editing capabilities. Note that actual AI functionality is disabled in Storybook preview mode.'
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        initialContent: { control: 'text' },
        placeholder: { control: 'text' },
    },
} satisfies Meta<typeof AIEditorDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const BusinessText: Story = {
    args: {
        initialContent: '<p>This businss proposal demsontrates how our comppany can increese your revenue by 25% in the next quarter with minimal invetsment. We beleive that our servvices will greeatly improove your overall profitabiliyty.</p><p>(Note: AI grammar correction is disabled in Storybook preview)</p>',
    },
};

export const LongText: Story = {
    args: {
        initialContent: '<p>This is a longer piece of text that might benefit from the Condense AI feature. It contains a lot of unnecessary details and filler words that could be removed to make the text more concise and to the point. The AI can help identify the key points and remove the less important information to create a more impactful message that gets straight to the point without all the extra verbiage that often clutters business communication.</p><p>(Note: AI condensing is disabled in Storybook preview)</p>',
    },
}; 