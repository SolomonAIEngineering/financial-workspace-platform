'use client';

import { useEffect, useRef, useState } from 'react';

import type { FeedbackType } from '@/actions/schema';

import {
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@udecode/cn';
import { toast } from 'sonner';

import { sendFeebackAction } from '@/actions/send-feedback-action';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Button } from '@/registry/default/potion-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { Textarea } from '@/registry/default/potion-ui/textarea';

/**
 * Defines the structure for feedback type options displayed in the form
 *
 * @property {string} id - Unique identifier for the feedback type option
 * @property {FeedbackType} type - The feedback type value (matches backend
 *   enum)
 * @property {string} label - Display label for the feedback type
 * @property {string} description - Detailed description of the feedback type
 * @property {React.ComponentType<React.SVGProps<SVGSVGElement>>} icon - Icon
 *   component to display with this feedback type
 * @property {string} color - CSS classes for default state styling
 * @property {string} activeColor - CSS classes for active/selected state
 *   styling
 * @property {string} iconColor - CSS classes for icon color
 * @interface FeedbackTypeOption
 */

// Define feedback type descriptions and icons with a black/dark color scheme
const feedbackTypes = [
  {
    id: 'feature',
    activeColor: 'bg-zinc-100 border-zinc-300 ring-2 ring-black ring-offset-1',
    color: 'bg-zinc-50 border-zinc-200 text-zinc-900 hover:bg-zinc-100',
    description: 'Suggest new features or improvements to existing ones',
    icon: SparklesIcon,
    iconColor: 'text-black',
    label: 'Feature Request',
    type: 'FEATURE' as FeedbackType,
  },
  {
    id: 'bug',
    activeColor: 'bg-zinc-100 border-zinc-300 ring-2 ring-black ring-offset-1',
    color: 'bg-zinc-50 border-zinc-200 text-zinc-900 hover:bg-zinc-100',
    description: 'Report issues or unexpected behavior',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-black',
    label: 'Bug Report',
    type: 'BUG' as FeedbackType,
  },
  {
    id: 'support',
    activeColor: 'bg-zinc-100 border-zinc-300 ring-2 ring-black ring-offset-1',
    color: 'bg-zinc-50 border-zinc-200 text-zinc-900 hover:bg-zinc-100',
    description: 'Get help using the application',
    icon: QuestionMarkCircleIcon,
    iconColor: 'text-black',
    label: 'Support',
    type: 'SUPPORT' as FeedbackType,
  },
  {
    id: 'general',
    activeColor: 'bg-zinc-100 border-zinc-300 ring-2 ring-black ring-offset-1',
    color: 'bg-zinc-50 border-zinc-200 text-zinc-900 hover:bg-zinc-100',
    description: 'Share other thoughts or feedback',
    icon: ChatBubbleOvalLeftEllipsisIcon,
    iconColor: 'text-black',
    label: 'General',
    type: 'GENERAL' as FeedbackType,
  },
];

/**
 * Maximum character limit for feedback text input
 *
 * @constant {number} MAX_CHARS
 */
const MAX_CHARS = 1000;

/**
 * CSS transition classes for card elements
 *
 * @constant {string} cardTransition
 */
const cardTransition = 'transition-all duration-200 ease-in-out';

/**
 * CSS transition classes for button elements
 *
 * @constant {string} buttonTransition
 */
const buttonTransition = 'transition-all duration-200 ease-in-out';

/**
 * CSS transition classes for focus state elements
 *
 * @constant {string} focusTransition
 */
const focusTransition = 'transition-all duration-150 ease-in-out';

/**
 * A sophisticated feedback collection form component that allows users to
 * submit different types of feedback (feature requests, bug reports, support
 * inquiries, or general feedback). Features include dynamic feedback type
 * selection, character counting, form validation, animated UI elements, and
 * integrated error handling.
 *
 * @example
 *   ```tsx
 *   <FeedbackForm />
 *   ```;
 *
 * @returns {JSX.Element} The rendered feedback form component
 * @component FeedbackForm
 */
export function FeedbackForm() {
  /** @state {boolean} isOpen - Controls the visibility of the feedback dialog */
  const [isOpen, setIsOpen] = useState(false);

  /** @state {string} feedback - Stores the user's feedback text */
  const [feedback, setFeedback] = useState('');

  /** @state {FeedbackType} feedbackType - Currently selected feedback type */
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('GENERAL');

  /** @state {boolean} isSubmitting - Tracks the submission process state */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** @state {number} charCount - Tracks the character count of the feedback text */
  const [charCount, setCharCount] = useState(0);

  /** @state {boolean} inputFocused - Tracks if the textarea is currently focused */
  const [inputFocused, setInputFocused] = useState(false);

  /** @state {boolean} submitted - Tracks if feedback was successfully submitted */
  const [submitted, setSubmitted] = useState(false);

  /** @ref {React.RefObject<HTMLTextAreaElement>} textareaRef - Reference to the feedback textarea element */
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Updates the character count whenever feedback text changes
   *
   * @effect
   * @dependency {string} feedback - The feedback text input
   */
  useEffect(() => {
    setCharCount(feedback.length);
  }, [feedback]);

  /**
   * Focuses the textarea when the dialog opens
   *
   * @effect
   * @dependency {boolean} isOpen - Dialog open state
   */
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Short delay to ensure the dialog is fully rendered
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * Resets the form when dialog closes
   *
   * @effect
   * @dependency {boolean} isOpen - Dialog open state
   */
  useEffect(() => {
    if (!isOpen) {
      // Reset form after dialog closes
      const timer = setTimeout(() => {
        if (!isOpen) {
          setFeedback('');
          setSubmitted(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * Handles the submission of feedback Validates the input, submits the
   * feedback, and handles success/error states
   *
   * @function handleSubmit
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');

      return;
    }
    if (feedback.length > MAX_CHARS) {
      toast.error(`Feedback exceeds maximum length of ${MAX_CHARS} characters`);

      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendFeebackAction({
        feedback: feedback.trim(),
        feedbackType,
      });

      // Check for data, which indicates success in next-safe-action
      if (result && 'data' in result) {
        setSubmitted(true);
        toast.success('Thank you for your feedback!');
        setTimeout(() => {
          setFeedback('');
          setFeedbackType('GENERAL');
          setIsOpen(false);
          setSubmitted(false);
        }, 500);
      }
      // Check for error, which indicates failure in next-safe-action
      else if (result && 'error' in result && result.error) {
        let errorMessage = 'Failed to submit feedback';

        if (
          typeof result.error === 'object' &&
          result.error &&
          'message' in result.error &&
          typeof result.error.message === 'string'
        ) {
          errorMessage = result.error.message;
        }

        console.error('Feedback submission error details:', result.error);
        toast.error(errorMessage, {
          description:
            'Please try again later or contact support if the issue persists.',
          duration: 5000,
        });
      } else {
        console.error('Unexpected result format:', result);
        toast.error('Failed to submit feedback', {
          description: 'Unexpected response format. Please try again later.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('An error occurred while submitting your feedback', {
        description:
          'Please try again later or contact support if the issue persists.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find current feedback type details
  const currentFeedbackType =
    feedbackTypes.find((type) => type.type === feedbackType) ||
    feedbackTypes[3];
  const FeedbackIcon = currentFeedbackType.icon;

  /**
   * Determines the color of the character count based on the length percentage
   *
   * @function getCharCountColor
   * @returns {string} CSS class names for the character count text
   */
  const getCharCountColor = () => {
    const percentage = charCount / MAX_CHARS;

    if (charCount > MAX_CHARS) return 'text-red-500 font-medium';
    if (percentage > 0.9) return 'text-red-500';
    if (percentage > 0.75) return 'text-amber-500';

    return 'text-muted-foreground';
  };

  /**
   * Generates a warning message based on the character count
   *
   * @function getCharCountWarning
   * @returns {string | null} Warning message or null if no warning is needed
   */
  const getCharCountWarning = () => {
    if (charCount > MAX_CHARS) {
      return `Exceeds limit by ${charCount - MAX_CHARS} characters`;
    }
    if (charCount > MAX_CHARS * 0.9) {
      return `Approaching limit (${MAX_CHARS - charCount} remaining)`;
    }

    return null;
  };

  const charCountWarning = getCharCountWarning();

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        className={cn(
          'h-6 gap-1 rounded-full px-2 text-xs',
          buttonTransition,
          'hover:bg-black hover:text-white hover:shadow-sm'
        )}
        onClick={() => setIsOpen(true)}
        title="Send Feedback"
      >
        <ChatBubbleLeftRightIcon className="h-3 w-3" />
        Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="overflow-hidden sm:max-w-xl">
          <DialogHeader className="border-b border-zinc-200 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-black" />
              Share Your Feedback
            </DialogTitle>
            <DialogDescription className="pt-1.5 text-muted-foreground">
              We value your input to improve our product. Your feedback helps us
              build a better experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-7 py-6">
            <div>
              <Label className="mb-3 block text-sm font-medium">
                Select feedback type
              </Label>
              <RadioGroup
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
                value={feedbackType}
                onValueChange={(value) =>
                  setFeedbackType(value as FeedbackType)
                }
              >
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = feedbackType === type.type;

                  return (
                    <div
                      key={type.id}
                      className={cn(
                        'relative flex cursor-pointer rounded-lg border p-4',
                        cardTransition,
                        'transform hover:scale-[1.02] hover:border-zinc-300 hover:shadow-sm',
                        'focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-1',
                        type.color,
                        isActive && type.activeColor,
                        isActive && 'shadow-sm'
                      )}
                      onClick={() => setFeedbackType(type.type)}
                    >
                      <input
                        id={type.id}
                        name="feedback-type"
                        className="absolute h-0 w-0 opacity-0"
                        checked={isActive}
                        value={type.type}
                        onChange={() => {}}
                        type="radio"
                      />
                      <div className="flex w-full gap-3">
                        <Icon
                          className={cn(
                            'mt-0.5 h-6 w-6 transition-transform duration-200',
                            type.iconColor,
                            isActive ? 'scale-110' : ''
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Label
                              className={cn(
                                'cursor-pointer text-sm font-medium',
                                'transition-colors duration-200',
                                isActive ? 'text-black' : 'text-zinc-700'
                              )}
                              htmlFor={type.id}
                            >
                              {type.label}
                            </Label>
                            <div className="flex h-4 w-4 items-center justify-center">
                              {isActive && (
                                <CheckCircleIcon className="fade-in h-4 w-4 animate-in text-black duration-300" />
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed opacity-80">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label className="block text-sm font-medium">
                  Your feedback
                </Label>
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      'text-xs transition-all duration-200',
                      getCharCountColor(),
                      inputFocused ? 'opacity-100' : 'opacity-70'
                    )}
                  >
                    {charCount}/{MAX_CHARS} characters
                  </span>
                  {charCountWarning && (
                    <span
                      className={cn(
                        'fade-in slide-in-from-top-2 mt-0.5 animate-in text-xs duration-200',
                        charCount > MAX_CHARS
                          ? 'text-red-500'
                          : 'text-amber-500'
                      )}
                    >
                      {charCountWarning}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  className={cn(
                    'min-h-[150px] w-full rounded-md border-input bg-background',
                    'px-3 py-3 text-sm',
                    'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
                    'focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
                    focusTransition,
                    inputFocused ? 'border-black shadow-sm' : '',
                    charCount > MAX_CHARS
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  )}
                  value={feedback}
                  onBlur={() => setInputFocused(false)}
                  onChange={(e) => setFeedback(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  placeholder={`Tell us about your ${currentFeedbackType.label.toLowerCase()}...`}
                />
                <div
                  className={cn(
                    'absolute right-3 bottom-3 text-xs text-muted-foreground',
                    'transition-opacity duration-200',
                    inputFocused ? 'opacity-100' : 'opacity-60'
                  )}
                >
                  <span className="text-xs text-muted-foreground">
                    Please be as specific as possible
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between border-t border-zinc-200 pt-4">
            <Button
              size="md"
              variant="ghost"
              className={cn(
                'text-muted-foreground',
                buttonTransition,
                'hover:bg-zinc-50 hover:text-black'
              )}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="md"
              className={cn(
                'gap-1.5 bg-black text-white',
                buttonTransition,
                'hover:scale-[1.01] hover:bg-zinc-800 active:scale-[0.99]',
                'shadow-sm hover:shadow',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100',
                isSubmitting ? 'pr-4 pl-3' : 'pr-5 pl-4'
              )}
              disabled={
                isSubmitting || !feedback.trim() || charCount > MAX_CHARS
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      fill="none"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                  Sending...
                </span>
              ) : submitted ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="h-4 w-4" />
                  Thank you!
                </span>
              ) : (
                <>
                  <FeedbackIcon className="h-4 w-4" />
                  Send {currentFeedbackType.label}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
