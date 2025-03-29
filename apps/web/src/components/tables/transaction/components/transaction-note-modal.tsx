'use client';

import * as React from 'react';

import {
  AlertCircleIcon,
  BuildingIcon,
  CheckIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  LayoutTemplateIcon,
  LockIcon,
  ReceiptIcon,
  RepeatIcon,
  SaveIcon,
  UnlockIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { Editor, EditorContainer } from '@/registry/default/potion-ui/editor';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/potion-ui/popover';
import {
  useUpdateTransaction,
  useUpdateTransactionNotes,
} from '@/trpc/hooks/transaction-hooks';

import { Button } from '@/registry/default/potion-ui/button';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NOTE_TEMPLATES } from '@/registry/default/example/transaction-notes';
import { Plate } from '@udecode/plate/react';
import type { Value } from '@udecode/plate';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCreateEditor } from '@/components/editor/use-create-editor';

interface TransactionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  initialNotes: string | null | undefined;
  initialRichNotes?: Value | null;
  onSuccess?: (updatedData?: any) => void;
  initialReadOnly?: boolean;
}

/**
 * TransactionNoteModal Component
 *
 * A modal dialog for creating and editing transaction notes with rich text
 * functionality. Provides a self-contained editor with template selection and
 * formatting capabilities.
 *
 * Features:
 *
 * - Rich text editing with Plate.js
 * - Template selection for structured notes
 * - Toggle between read-only and edit modes
 * - Keyboard navigation handling to prevent modal closing
 * - Preservation of both plain text and rich content for compatibility
 *
 * @example
 *   ```tsx
 *   <TransactionNoteModal
 *     isOpen={true}
 *     onClose={() => setIsOpen(false)}
 *     transactionId="txn_123456"
 *     initialNotes="Some existing notes"
 *     initialReadOnly={false}
 *     onSuccess={(data) => console.info("Notes updated", data)}
 *   />
 *   ```;
 */
export function TransactionNoteModal({
  isOpen,
  onClose,
  transactionId,
  initialNotes,
  initialRichNotes,
  onSuccess,
  initialReadOnly = false,
}: TransactionNoteModalProps) {
  /**
   * Keyboard event handler to prevent modal from closing during keyboard
   * navigation
   *
   * This effect sets up a capture-phase event listener that prevents keyboard
   * navigation events (arrows, tab, etc.) from propagating beyond editable
   * elements. This solves the issue of keyboard interaction accidentally
   * closing the modal when navigating within the editor.
   *
   * The capture phase ensures our handler runs before other handlers in the
   * bubbling phase.
   */
  React.useEffect(() => {
    if (!isOpen) return;

    /**
     * Handles keydown events to prevent modal closing during navigation
     * Allows default behavior in editable elements but stops propagation
     * for navigation keys
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
      if (
        [
          'ArrowDown',
          'ArrowUp',
          'ArrowLeft',
          'ArrowRight',
          'Tab',
          'PageUp',
          'PageDown',
          'Home',
          'End',
        ].includes(e.key)
      ) {
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
    <Dialog open={isOpen} dismissible={false}>
      {/* 
              Dialog container with responsive sizing for different screen sizes:
              - Uses smaller width on small screens for better mobile experience
              - Expands to 90% of viewport on medium and larger screens for maximum workspace
              - Hides the default close button (we use our own controls for better UX)
              - Removes scrollbars for cleaner UI appearance
            */}
      <DialogContent
        className="scrollbar-hide rounded-xl border-border/20 shadow-2xl backdrop-blur-sm sm:max-w-[600px] md:min-h-[90%] md:min-w-[90%]"
        hideClose
      >
        <DialogHeader className="border-b border-border/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileTextIcon className="size-5" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Transaction Notes
            </DialogTitle>
          </div>
          <DialogDescription className="mt-3 ml-1 text-sm text-foreground/70">
            Add or edit notes for this transaction. Notes can include details
            about purpose, context, or follow-up actions.
          </DialogDescription>
        </DialogHeader>

        <DndProvider backend={HTML5Backend}>
          <TransactionNoteEditor
            transactionId={transactionId}
            initialNotes={initialNotes}
            initialRichNotes={initialRichNotes}
            initialReadOnly={initialReadOnly}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </DndProvider>
      </DialogContent>
    </Dialog>
  );
}

interface TransactionNoteEditorProps {
  transactionId: string;
  initialNotes: string | null | undefined;
  initialRichNotes?: Value | null;
  onClose: () => void;
  onSuccess?: (updatedData?: any) => void;
  initialReadOnly?: boolean;
}

/**
 * TransactionNoteEditor Component
 *
 * The internal component that handles state management and editor
 * functionality. Provides template selection, rich text editing, and saving to
 * database.
 *
 * Features:
 *
 * - Template selection from predefined note templates
 * - Rich text editing with formatting options
 * - Toggle between read-only and edit modes
 * - Save functionality with database integration
 *
 * @param props - Component properties
 * @param props.transactionId - ID of the transaction to edit notes for
 * @param props.initialNotes - Plain text initial notes if available
 * @param props.initialRichNotes - Rich text format initial notes if available
 * @param props.onClose - Function to call when closing the modal
 * @param props.onSuccess - Callback function when notes are successfully saved
 * @param props.initialReadOnly - Whether the notes should start in read-only
 *   mode
 */
function TransactionNoteEditor({
  transactionId,
  initialNotes,
  initialRichNotes,
  onClose,
  onSuccess,
  initialReadOnly = false,
}: TransactionNoteEditorProps) {
  // State management
  const [isReadOnly, setIsReadOnly] = React.useState(initialReadOnly);
  const [activeTemplate, setActiveTemplate] = React.useState<string | null>(
    null
  );
  const updateTransaction = useUpdateTransaction();
  const updateNotes = useUpdateTransactionNotes();
  const [isSaving, setIsSaving] = React.useState(false);

  /**
   * Processes initial content to create the starting value for the editor.
   * Prioritizes rich content if available, falls back to plain text, and uses
   * an empty paragraph as a last resort.
   */
  const initialValue = React.useMemo(() => {
    // Use rich notes if provided and valid
    if (initialRichNotes && Array.isArray(initialRichNotes)) {
      console.info('Using rich notes content:', initialRichNotes);
      return initialRichNotes;
    }

    // Convert plain text to rich text format
    if (initialNotes) {
      console.info('Converting plain text to rich format:', initialNotes);
      // Create paragraphs for each line of text
      return initialNotes.split('\n').map((line) => ({
        type: 'p',
        children: [{ text: line }],
      }));
    }

    // Default empty value
    console.info('Using default empty value');
    return [{ type: 'p', children: [{ text: '' }] }];
  }, [initialNotes, initialRichNotes]);

  // State for the current editor value
  const [editorValue, setEditorValue] = React.useState<Value>(initialValue);

  // Track when a template is selected
  const [selectedTemplate, setSelectedTemplate] = React.useState<Value | null>(
    null
  );

  // Create editor instance with initial value
  const editor = useCreateEditor(
    {
      id: `transaction-notes-${transactionId}`,
      value: editorValue,
      readOnly: isReadOnly,
    },
    [transactionId]
  );

  // Ensure editor content is properly initialized when transaction changes
  // but not when just toggling read-only mode
  React.useEffect(() => {
    // Set editor value from initialValue
    setEditorValue(initialValue);

    // Also directly update the editor's children for immediate rendering
    if (editor) {
      editor.children = initialValue;
    }

    setIsReadOnly(initialReadOnly);
  }, [transactionId, initialValue, initialReadOnly, editor]);

  // Ensure the editor stays in read-only mode without affecting content
  React.useEffect(() => {
    if (editor && typeof editor.setReadOnly === 'function') {
      editor.setReadOnly(isReadOnly);
    }
  }, [isReadOnly, editor]);

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
   * Returns a short descriptive text for each template type
   *
   * @param templateId - The ID of the template to describe
   * @returns A short description of the template
   */
  const getTemplateDescription = (templateId: string): string => {
    switch (templateId) {
      case 'basic':
        return 'Standard format for transaction details with essential information fields.';
      case 'business':
        return 'Structured format for business expenses with tax and receipt information.';
      case 'client':
        return 'Client-focused template for tracking customer transactions and project details.';
      case 'recurring':
        return 'Template for subscription and recurring payment documentation with renewal info.';
      case 'dispute':
        return 'Documentation format for transaction disputes with case tracking fields.';
      case 'financial-review':
        return 'Comprehensive template for financial audits and transaction reviews.';
      case 'vendor-payment':
        return 'Specialized template for vendor payment processing and documentation.';
      default:
        return 'Template with structured fields for transaction documentation.';
    }
  };

  /**
   * Returns an appropriate icon for each template type
   *
   * @param templateId - The ID of the template to get an icon for
   * @returns A React component for the icon
   */
  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'basic':
        return <FileTextIcon className="size-4" />;
      case 'business':
        return <ReceiptIcon className="size-4" />;
      case 'client':
        return <UsersIcon className="size-4" />;
      case 'recurring':
        return <RepeatIcon className="size-4" />;
      case 'dispute':
        return <AlertCircleIcon className="size-4" />;
      case 'financial-review':
        return <ClipboardCheckIcon className="size-4" />;
      case 'vendor-payment':
        return <BuildingIcon className="size-4" />;
      default:
        return <FileTextIcon className="size-4" />;
    }
  };

  /**
   * Applies a selected template to the editor Replaces the current content
   * with the template structure
   *
   * @param templateId - The ID of the template to apply
   */
  const handleTemplateChange = (templateId: string) => {
    const template = NOTE_TEMPLATES.find((t) => t.value === templateId);
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
   * Toggles the editor's read-only state Simply switches the isReadOnly state
   * which is passed to the Plate component
   */
  const toggleReadOnly = () => {
    setIsReadOnly((prev) => !prev);
  };

  /**
   * Extracts plain text from rich content structure Used for backward
   * compatibility with systems that only store plain text.
   *
   * @param value - The rich content value to extract text from
   * @returns Plain text representation of the rich content
   */
  const getPlainTextFromValue = (value: Value): string => {
    return value
      .map((node) =>
        'children' in node
          ? node.children
              .map((child) => ('text' in child ? child.text : ''))
              .join('')
          : ''
      )
      .join('\n')
      .trim();
  };

  /**
   * Saves the current editor content to the transaction record Stores both
   * rich content (for the editor) and plain text (for compatibility) Shows
   * success/error notifications and triggers the onSuccess callback
   */
  const handleSave = () => {
    if (!transactionId) return;

    // Get both the rich text value and plain text for backward compatibility
    const plainTextNotes = getPlainTextFromValue(editorValue);

    // Prepare the rich content - ensure it's a valid JSON string
    const richContent =
      typeof editorValue === 'string'
        ? editorValue
        : JSON.stringify(editorValue);

    // Set saving state
    setIsSaving(true);

    // First update the basic notes with the dedicated notes endpoint
    updateNotes({
      id: transactionId,
      notes: richContent,
    });

    // Then update the rich content and read-only flag with the general update endpoint
    updateTransaction.mutate(
      {
        id: transactionId,
        data: {
          notes: richContent,
          isNoteReadOnly: isReadOnly,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success('Transaction notes updated');
          setIsSaving(false);
          onClose();
          if (onSuccess) {
            onSuccess({
              notes: richContent,
              notesRichContent: editorValue,
              isNoteReadOnly: isReadOnly,
            });
          }
        },
        onError: (error) => {
          setIsSaving(false);
          toast.error(`Failed to update rich content: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-border/20 bg-muted/20 px-2 py-4">
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isReadOnly}
                className="h-11 gap-2.5 rounded-md border-border/50 bg-background px-4 shadow-sm transition-all hover:bg-accent/30 hover:shadow-md focus:ring-1 focus:ring-primary/30"
              >
                <LayoutTemplateIcon className="size-4.5 text-primary/80" />
                <span className="font-medium">
                  {activeTemplate
                    ? NOTE_TEMPLATES.find((t) => t.value === activeTemplate)
                        ?.label
                    : 'Choose Template'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[530px] rounded-lg border border-border/20 bg-background/98 p-4 shadow-xl backdrop-blur-sm"
              align="start"
              sideOffset={8}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-foreground/90">
                    Choose a template
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Select a pre-defined structure for your notes
                  </p>
                </div>
                <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto pt-1 pr-1 pb-1">
                  {NOTE_TEMPLATES.map((template) => (
                    <Card
                      key={template.value}
                      className={cn(
                        'group cursor-pointer overflow-hidden border-border/30 transition-all duration-200 hover:border-primary/40 hover:shadow-md',
                        activeTemplate === template.value &&
                          'border-primary/60 bg-primary/5 shadow-md ring-1 ring-primary/30'
                      )}
                      onClick={() => handleTemplateChange(template.value)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col gap-1">
                          <div
                            className={cn(
                              'flex items-center gap-2.5 border-b border-border/20 px-3.5 py-2.5 transition-colors',
                              activeTemplate === template.value
                                ? 'bg-primary/10 text-primary-foreground/90'
                                : 'bg-muted/40 text-foreground/80 group-hover:bg-muted/80'
                            )}
                          >
                            <div
                              className={cn(
                                'rounded-md p-1.5 transition-colors',
                                activeTemplate === template.value
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-background/80 text-muted-foreground group-hover:text-primary/70'
                              )}
                            >
                              {getTemplateIcon(template.value)}
                            </div>
                            <span className="text-sm font-medium">
                              {template.label}
                            </span>
                            {activeTemplate === template.value && (
                              <div className="ml-auto rounded-full bg-primary/20 p-0.5 text-primary">
                                <CheckIcon className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="line-clamp-2 px-3.5 py-3 text-xs text-muted-foreground">
                            {getTemplateDescription(template.value)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isReadOnly ? 'outline' : 'ghost'}
            size="sm"
            className={`h-11 gap-2.5 rounded-md px-4 shadow-sm transition-all ${
              isReadOnly
                ? 'border-amber-300 bg-amber-50/50 text-amber-700 hover:border-amber-400 hover:bg-amber-100/70 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/60'
                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20'
            }`}
            onClick={toggleReadOnly}
          >
            {isReadOnly ? (
              <>
                <UnlockIcon className="size-4" />
                <span className="font-medium">Enable Editing</span>
              </>
            ) : (
              <>
                <LockIcon className="size-4" />
                <span className="font-medium">Lock Document</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateTransaction.isPending}
            className="h-11 gap-2.5 rounded-md border-border/50 px-4 shadow-sm transition-all hover:border-border hover:bg-background/80"
          >
            <XIcon className="size-4" />
            <span>Cancel</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 gap-2.5 rounded-md bg-primary/90 px-4 font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary hover:shadow"
          >
            <SaveIcon className="size-4" />
            <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="mt-7 min-h-[350px] flex-1 text-left">
        <DndProvider backend={HTML5Backend}>
          <div
            onKeyDown={(e) => {
              // Prevent keyboard navigation events from bubbling up and closing the modal
              if (
                [
                  'ArrowDown',
                  'ArrowUp',
                  'ArrowLeft',
                  'ArrowRight',
                  'Tab',
                  'PageUp',
                  'PageDown',
                  'Home',
                  'End',
                ].includes(e.key)
              ) {
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
                <div
                  className={`absolute top-4 right-4 z-10 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 shadow-sm transition-all duration-300 dark:border-amber-800 dark:bg-amber-900/30 ${isReadOnly ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
                >
                  <LockIcon className="size-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Read Only
                  </span>
                </div>
                <EditorContainer
                  className={`items-start justify-start rounded-xl border shadow-sm transition-all duration-200 ${
                    isReadOnly
                      ? 'border-amber-200/30 bg-amber-50/20 dark:border-amber-800/20 dark:bg-amber-950/10'
                      : 'border-border/20 bg-background/40 hover:border-border/30 hover:shadow'
                  }`}
                >
                  <Editor
                    readOnly={isReadOnly}
                    variant="default"
                    placeholder="Enter notes about this transaction..."
                    className={`min-h-[340px] items-start justify-start p-6 text-left focus:outline-none ${
                      isReadOnly
                        ? 'cursor-default text-foreground/80'
                        : 'text-foreground/90'
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
