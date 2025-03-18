import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '../index';
import { fn } from '@storybook/test';

const LinkEditorDemo = ({ initialContent, placeholder }: { initialContent?: string, placeholder?: string }) => {
    return (
        <div className="w-full max-w-[800px] border border-border rounded-md p-4">
            <div className="mb-4 space-y-2">
                <h3 className="font-medium">Link Management in Editor</h3>
                <p className="text-sm text-gray-500">
                    Select text and click the link icon in the bubble menu to add or edit links.
                    <br />
                    You can also try typing a URL directly, which will be auto-linked.
                </p>
            </div>
            <Editor
                initialContent={initialContent || '<p>Select this text and click the link icon to add a link. You can also try typing a URL like https://example.com which should be auto-linked.</p><p>Here\'s an example of <a href="https://solomonai.co/">an existing link</a> you can edit.</p>'}
                placeholder={placeholder}
                className="min-h-[200px]"
            />
        </div>
    );
};

const meta = {
    title: 'Components/Editor/Link Feature',
    component: LinkEditorDemo,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        initialContent: { control: 'text' },
        placeholder: { control: 'text' },
    },
} satisfies Meta<typeof LinkEditorDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const WithExistingLinks: Story = {
    args: {
        initialContent: '<p>This paragraph has <a href="https://solomonai.co/">multiple</a> <a href="https://github.com/">links</a> that you can <a href="https://tailwindcss.com/">edit</a> or remove.</p><p>You can also add new links by selecting text and clicking the link icon in the bubble menu.</p>',
    },
};

export const PlainText: Story = {
    args: {
        initialContent: '<p>This is plain text with no links yet. Select some text and add a link!</p><p>You can also try typing raw URLs like example.com or https://solomonai.co to see auto-linking in action.</p>',
    },
}; 