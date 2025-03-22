'use client';

import * as React from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { Editor, EditorContainer } from '@/registry/default/potion-ui/editor';
import { FileTextIcon, LockIcon, SaveIcon, UnlockIcon, XIcon } from 'lucide-react';
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
import type { Value } from '@udecode/plate';
import { toast } from 'sonner';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { useUpdateTransaction } from '@/trpc/hooks/transaction-hooks';

interface TransactionNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: string;
    initialNotes: string | null | undefined;
    initialRichNotes?: Value | null;
    onSuccess?: (updatedData?: any) => void;
    isReadOnly?: boolean;
}

/**
 * TransactionNoteModal Component
 * 
 * A modal dialog for creating and editing transaction notes with rich text functionality.
 * Provides a self-contained editor with template selection and formatting capabilities.
 * 
 * Features:
 * - Rich text editing with Plate.js
 * - Template selection for structured notes
 * - Toggle between read-only and edit modes
 * - Keyboard navigation handling to prevent modal closing
 * - Preservation of both plain text and rich content for compatibility
 * 
 * @example
 * ```tsx
 * <TransactionNoteModal
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 *   transactionId="txn_123456"
 *   initialNotes="Some existing notes"
 *   onSuccess={(data) => console.log("Notes updated", data)}
 * />
 * ```
 */
export function TransactionNoteModal({
    isOpen,
    onClose,
    transactionId,
    initialNotes,
    initialRichNotes,
    onSuccess,
    isReadOnly = false,
}: TransactionNoteModalProps) {
    /**
     * Keyboard event handler to prevent modal from closing during keyboard navigation
     * 
     * This effect sets up a capture-phase event listener that prevents keyboard
     * navigation events (arrows, tab, etc.) from propagating beyond editable elements.
     * This solves the issue of keyboard interaction accidentally closing the modal
     * when navigating within the editor.
     * 
     * The capture phase ensures our handler runs before other handlers in the bubbling phase.
     */
    React.useEffect(() => {
        if (!isOpen) return;

        /**
         * Handles keydown events to prevent modal closing during navigation
         * Allows default behavior in editable elements but stops propagation for navigation keys
         * 
         * @param {KeyboardEvent} e - The keyboard event object
         */
        const handleKeyDown = (e: KeyboardEvent) => {
            // If we're in an editor or form element, let the default behavior happen
            if (e.target instanceof HTMLElement) {
                const tagName = e.target.tagName.toLowerCase();

                // Don't interfere with inputs, textareas, or contenteditable elements
                const isEditableElement =
                    tagName === 'input' ||
                    tagName === 'textarea' ||
                    e.target.getAttribute('contenteditable') === 'true' ||
                    e.target.closest('[contenteditable="true"]') !== null;

                if (isEditableElement) {
                    return; // Allow default handling in editor
                }
            }

            // For navigation keys, prevent them from closing the modal
            if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Tab', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
                e.stopPropagation();
            }
        };

        // Use capture phase to intercept events before they reach components
        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen]);

    // Dialog wrapper with context
    return (
        <Dialog
            open={isOpen}
            dismissible={false}
        >
            {/* 
              Dialog container with responsive sizing for different screen sizes:
              - Uses smaller width on small screens for better mobile experience
              - Expands to 90% of viewport on medium and larger screens for maximum workspace
              - Hides the default close button (we use our own controls for better UX)
              - Removes scrollbars for cleaner UI appearance
            */}
            <DialogContent className="sm:max-w-[600px] md:min-w-[90%] md:min-h-[90%] scrollbar-hide" hideClose>
                <DialogHeader className="pb-5 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <FileTextIcon className="size-5" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Transaction Notes</DialogTitle>
                    </div>
                    <DialogDescription className="text-foreground/70 mt-3 ml-1 text-sm">
                        Add or edit notes for this transaction. Notes can include details about purpose, context, or follow-up actions.
                    </DialogDescription>
                </DialogHeader>

                <TransactionNoteEditor
                    transactionId={transactionId}
                    initialNotes={initialNotes}
                    initialRichNotes={initialRichNotes}
                    isReadOnly={isReadOnly}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}

/**
 * TransactionNoteEditor Component
 * 
 * The internal editor component used by the TransactionNoteModal.
 * Handles the state management, editing functionality, and saving operations.
 * 
 * Features:
 * - Template selection and application
 * - Rich text editing interface
 * - Read-only mode toggle
 * - Handles saving to database via API
 * - Converts between rich text and plain text formats
 * 
 * @param props - Component properties
 * @param props.transactionId - ID of the transaction being edited
 * @param props.initialNotes - Initial plain text notes (if any)
 * @param props.initialRichNotes - Initial rich content (if available)
 * @param props.isReadOnly - Whether to start in read-only mode
 * @param props.onClose - Function to call when closing the editor
 * @param props.onSuccess - Callback for successful note updates
 * @returns A rich text editor component
 */
function TransactionNoteEditor({
    transactionId,
    initialNotes,
    initialRichNotes,
    isReadOnly: initialReadOnly = false,
    onClose,
    onSuccess,
}: {
    transactionId: string;
    initialNotes: string | null | undefined;
    initialRichNotes?: Value | null;
    isReadOnly?: boolean;
    onClose: () => void;
    onSuccess?: (updatedData?: any) => void;
}) {
    // State management
    const [isReadOnly, setIsReadOnly] = React.useState(initialReadOnly);
    const [activeTemplate, setActiveTemplate] = React.useState<string | null>(null);
    const updateTransaction = useUpdateTransaction();

    /**
     * Processes initial content to create the starting value for the editor.
     * Prioritizes rich content if available, falls back to plain text,
     * and uses an empty paragraph as a last resort.
     */
    const initialValue = React.useMemo(() => {
        // Use rich notes if provided and valid
        if (initialRichNotes && Array.isArray(initialRichNotes)) {
            console.log('Using rich notes content:', initialRichNotes);
            return initialRichNotes;
        }

        // Convert plain text to rich text format
        if (initialNotes) {
            console.log('Converting plain text to rich format:', initialNotes);
            // Create paragraphs for each line of text
            return initialNotes.split('\n').map(line => ({
                type: 'p',
                children: [{ text: line }]
            }));
        }

        // Default empty value
        console.log('Using default empty value');
        return [{ type: 'p', children: [{ text: '' }] }];
    }, [initialNotes, initialRichNotes]);

    // State for the current editor value
    const [editorValue, setEditorValue] = React.useState<Value>(initialValue);

    // Track when a template is selected
    const [selectedTemplate, setSelectedTemplate] = React.useState<Value | null>(null);

    // Create editor instance with initial value
    const editor = useCreateEditor({
        id: `transaction-notes-${transactionId}`,
        value: editorValue,
        readOnly: isReadOnly,
    }, [transactionId]);

    // Ensure editor content is properly initialized when transaction changes
    React.useEffect(() => {
        // Set editor value from initialValue
        setEditorValue(initialValue);

        // Also directly update the editor's children for immediate rendering
        if (editor) {
            editor.children = initialValue;
        }

        setIsReadOnly(initialReadOnly);
    }, [transactionId, initialValue, initialReadOnly, editor]);

    // Handle template selection changes
    React.useEffect(() => {
        if (selectedTemplate && editor) {
            // Update the editor with the selected template value
            editor.children = selectedTemplate;
            setEditorValue(selectedTemplate);
            setSelectedTemplate(null);
        }
    }, [selectedTemplate, editor]);

    /**
     * Applies a selected template to the editor
     * Replaces the current content with the template structure
     * 
     * @param templateId - The ID of the template to apply
     */
    const handleTemplateChange = (templateId: string) => {
        const template = NOTE_TEMPLATES.find(t => t.value === templateId);
        if (template) {
            setActiveTemplate(templateId);
            // Deep clone the template to ensure we're not modifying the original
            const templateClone = JSON.parse(JSON.stringify(template.template));
            setSelectedTemplate(templateClone);

            // Force immediate update
            if (editor) {
                editor.children = templateClone;
                setEditorValue(templateClone);
            }
        }
    };

    /**
     * Toggles the editor's read-only state
     * Simply switches the isReadOnly state which is passed to the Plate component
     */
    const toggleReadOnly = () => {
        setIsReadOnly(prev => !prev);
    };

    /**
     * Extracts plain text from rich content structure
     * Used for backward compatibility with systems that only store plain text.
     * 
     * @param value - The rich content value to extract text from
     * @returns Plain text representation of the rich content
     */
    const getPlainTextFromValue = (value: Value): string => {
        return value
            .map(node =>
                'children' in node
                    ? node.children
                        .map(child => 'text' in child ? child.text : '')
                        .join('')
                    : ''
            )
            .join('\n')
            .trim();
    };

    /**
     * Saves the current editor content to the transaction record
     * Stores both rich content (for the editor) and plain text (for compatibility)
     * Shows success/error notifications and triggers the onSuccess callback
     */
    const handleSave = () => {
        if (!transactionId) return;

        // Get both the rich text value and plain text for backward compatibility
        const plainTextNotes = getPlainTextFromValue(editorValue);

        // Prepare the rich content - ensure it's a valid JSON string
        const richContent = typeof editorValue === 'string'
            ? editorValue
            : JSON.stringify(editorValue);

        updateTransaction.mutate(
            {
                id: transactionId,
                data: {
                    // Store both formats - plain text for backward compatibility
                    notes: plainTextNotes,
                    // And rich text format for the enhanced editor
                    notesRichContent: richContent
                } as any,
            },
            {
                onSuccess: () => {
                    toast.success('Transaction notes updated');
                    onClose();
                    if (onSuccess) {
                        onSuccess({
                            notes: plainTextNotes,
                            notesRichContent: editorValue
                        });
                    }
                },
                onError: (error) => {
                    toast.error(`Failed to update notes: ${error.message}`);
                },
            }
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between py-3 px-1 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <FileTextIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground/80">Template:</span>
                    </div>
                    <Select
                        value={activeTemplate || undefined}
                        onValueChange={handleTemplateChange}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger className="w-[240px] h-10 bg-background border-border/50 hover:bg-accent/30 transition-all rounded-md shadow-sm hover:shadow focus:ring-1 focus:ring-primary/30">
                            <SelectValue placeholder="Choose a template..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto shadow-md border-primary/10 bg-background/95 backdrop-blur-sm">
                            {NOTE_TEMPLATES.map(template => (
                                <SelectItem
                                    key={template.value}
                                    value={template.value}
                                    className="hover:bg-primary/5 focus:bg-primary/10 transition-colors"
                                >
                                    {template.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant={isReadOnly ? "outline" : "ghost"}
                        size="sm"
                        className={`h-10 transition-all gap-2 rounded-md shadow-sm ${isReadOnly
                            ? "border-amber-300 bg-amber-50/50 text-amber-700 hover:bg-amber-100/70 hover:border-amber-400 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/60"
                            : "text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            }`}
                        onClick={toggleReadOnly}
                    >
                        {isReadOnly ? (
                            <>
                                <UnlockIcon className="size-4 text-amber-500 dark:text-amber-400" />
                                <span className="font-medium">Enable Editing</span>
                            </>
                        ) : (
                            <>
                                <LockIcon className="size-4 text-blue-500 dark:text-blue-400" />
                                <span className="font-medium">Lock Document</span>
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={updateTransaction.isPending}
                        className="h-10 gap-2 rounded-md border-border/50 hover:bg-background/80 hover:border-border shadow-sm transition-all"
                    >
                        <XIcon className="size-4" />
                        <span>Cancel</span>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateTransaction.isPending || isReadOnly}
                        className="h-10 gap-2 bg-primary/90 text-primary-foreground hover:bg-primary rounded-md shadow-sm hover:shadow transition-all font-medium"
                    >
                        <SaveIcon className="size-4" />
                        <span>{updateTransaction.isPending ? 'Saving...' : 'Save Notes'}</span>
                    </Button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 mt-6 min-h-[350px] text-left">
                <DndProvider backend={HTML5Backend}>
                    <div
                        /**
                         * Keyboard handler for the editor container
                         * Prevents navigation keys from bubbling to parent components
                         * while still allowing them to function within the editor.
                         * This is a secondary defense alongside the global keyboard handler.
                         * 
                         * @param {React.KeyboardEvent} e - The keyboard event
                         */
                        onKeyDown={(e) => {
                            // Prevent keyboard navigation events from bubbling up and closing the modal
                            if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Tab', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
                                e.stopPropagation();
                                // Allow the default behavior within the editor
                            }
                        }}
                    >
                        <Plate
                            editor={editor}
                            onValueChange={({ value }) => setEditorValue(value)}
                            readOnly={isReadOnly}
                        >
                            <div className="relative">
                                <div className={`absolute right-4 top-4 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md shadow-sm dark:bg-amber-900/30 dark:border-amber-800 z-10 transition-all duration-300 ${isReadOnly ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <LockIcon className="size-3.5 text-amber-500 dark:text-amber-400" />
                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Read Only</span>
                                </div>
                                <EditorContainer
                                    className={`justify-start items-start border shadow-sm rounded-lg transition-all duration-200 ${isReadOnly
                                        ? 'bg-amber-50/20 border-amber-200/30 dark:bg-amber-950/10 dark:border-amber-800/20'
                                        : 'bg-background/40 border-border/20 hover:border-border/30 hover:shadow'
                                        }`}
                                >
                                    <Editor
                                        readOnly={isReadOnly}
                                        variant="default"
                                        placeholder="Enter notes about this transaction..."
                                        className={`text-left p-6 min-h-[340px] focus:outline-none justify-start items-start ${isReadOnly ? 'text-foreground/80 cursor-default' : 'text-foreground/90'
                                            }`}
                                    />
                                </EditorContainer>
                            </div>
                        </Plate>
                    </div>
                </DndProvider>
            </div>
        </div>
    );
} 