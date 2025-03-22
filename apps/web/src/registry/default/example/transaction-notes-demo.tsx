'use client';

import * as React from 'react';

import { Editor, EditorContainer } from '@/registry/default/potion-ui/editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import { Button } from '@/registry/default/potion-ui/button';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NOTE_TEMPLATES } from '@/registry/default/example/transaction-notes';
import { Plate } from '@udecode/plate/react';
import { Value } from '@udecode/plate';
import { useCreateEditor } from '@/components/editor/use-create-editor';

export default function TransactionNotesDemo() {
    const [transactionId] = React.useState('demo-transaction-123');
    const [currentTemplate, setCurrentTemplate] = React.useState(NOTE_TEMPLATES[0].value);
    const [editorValue, setEditorValue] = React.useState<Value>(NOTE_TEMPLATES[0].template);
    const [isReadOnly, setIsReadOnly] = React.useState(false);

    // Create editor with dependency on transactionId and editorValue
    const editor = useCreateEditor({
        id: `transaction-notes-${transactionId}`,
        value: editorValue,
        readOnly: isReadOnly,
    }, [transactionId, editorValue, isReadOnly]);

    const handleTemplateChange = (value: string) => {
        setCurrentTemplate(value);
        const newTemplate = NOTE_TEMPLATES.find(t => t.value === value)?.template;
        if (newTemplate) {
            setEditorValue(newTemplate);
        }
    };

    const handleValueChange = ({ value }: { value: Value }) => {
        setEditorValue(value);
        // In a real app, you would save this to the server using a debounced function
        console.log('Note content updated:', value);
    };

    const toggleReadOnly = () => {
        setIsReadOnly(prev => !prev);
    };

    // Mock save function - in a real app, this would send data to an API
    const handleSave = () => {
        // Convert rich text value to plain text for demonstration
        const plainTextNotes = editorValue
            .map(node =>
                'children' in node
                    ? node.children
                        .map(child => 'text' in child ? child.text : '')
                        .join('')
                    : ''
            )
            .join('\n')
            .trim();

        console.log('Saving note content:', plainTextNotes);
        // In a real app: await saveTransactionNote(transactionId, editorValue);
        alert('Transaction note saved!');
    };

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Transaction Note Editor</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Add or edit notes for this transaction using the rich text editor below.
            </p>

            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm">Template:</span>
                    <Select value={currentTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Choose a template..." />
                        </SelectTrigger>
                        <SelectContent>
                            {NOTE_TEMPLATES.map(template => (
                                <SelectItem key={template.value} value={template.value}>
                                    {template.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleReadOnly}
                    >
                        {isReadOnly ? "Enable Editing" : "Lock Document"}
                    </Button>
                </div>
            </div>

            <div className="border rounded-md p-4 bg-white dark:bg-gray-800">
                <DndProvider backend={HTML5Backend}>
                    <Plate
                        editor={editor}
                        onValueChange={handleValueChange}
                        readOnly={isReadOnly}
                    >
                        <EditorContainer className="min-h-[300px] border border-input rounded-md">
                            <Editor
                                variant="default"
                                placeholder="Enter notes about this transaction..."
                            />
                        </EditorContainer>
                    </Plate>
                </DndProvider>
            </div>

            <div className="flex justify-end mt-4">
                <Button
                    onClick={handleSave}
                    disabled={isReadOnly}
                >
                    Save Notes
                </Button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                <p>This editor provides a document-like experience for transaction notes.</p>
                <p>Changes are tracked and will be saved when you click the "Save Notes" button.</p>
                <p>{isReadOnly ? "The document is currently locked for viewing only." : "The document is currently editable."}</p>
            </div>
        </div>
    );
} 