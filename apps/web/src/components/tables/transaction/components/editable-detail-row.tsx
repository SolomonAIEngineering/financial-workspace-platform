import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { HelpCircle } from 'lucide-react';
import { Input } from '@/registry/default/potion-ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/registry/default/potion-ui/textarea';

interface Option {
  label: string;
  value: string;
}

interface EditableDetailRowProps {
  label: string;
  value?: string | boolean;
  onChange?: (value: string | boolean) => void;
  tooltip?: string;
  isTextarea?: boolean;
  isSelect?: boolean;
  isBoolean?: boolean;
  options?: Option[];
  placeholder?: string;
  children?: React.ReactNode;
}

/**
 * EditableDetailRow component - Renders an editable form field for transaction
 * details.
 *
 * This component is used in edit mode to allow users to modify transaction
 * data. It supports text inputs, textareas for longer content, select dropdowns
 * for fields with predefined options, and custom inputs via children.
 *
 * @param {EditableDetailRowProps} props - Component props
 * @param {string} props.label - The label for the field
 * @param {string | boolean} [props.value] - The current value of the field
 * @param {Function} [props.onChange] - Callback function when value changes
 * @param {string} [props.tooltip] - Optional tooltip text for the field
 * @param {boolean} [props.isTextarea] - If true, renders a textarea instead of
 *   input
 * @param {boolean} [props.isSelect] - If true, renders a select dropdown
 * @param {boolean} [props.isBoolean] - If true, renders a switch for boolean
 *   values
 * @param {Option[]} [props.options] - Options for select dropdown
 * @param {string} [props.placeholder] - Placeholder text for the input
 * @param {React.ReactNode} [props.children] - Custom input element to render
 * @returns {JSX.Element} The rendered editable detail row
 */
export function EditableDetailRow({
  label,
  value,
  onChange,
  tooltip,
  isTextarea = false,
  isSelect = false,
  isBoolean = false,
  options = [],
  placeholder = '',
  children,
}: EditableDetailRowProps) {
  const id = React.useId();

  // If children are provided, render them instead of the default input types
  const hasCustomInput = !!children;

  return (
    <div className="mb-4 rounded-lg transition-all duration-200">
      <div className="mb-1.5 flex items-center gap-2">
        <Label htmlFor={id} className="text-xs font-medium text-foreground/80">
          {label}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 transition-colors hover:text-muted-foreground/80" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs border-border/40 bg-background/95 shadow-md backdrop-blur-sm"
              >
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {hasCustomInput ? (
        // Render custom input (usually a complex component like DatePicker)
        <div className="rounded-md transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/30">
          {children}
        </div>
      ) : isBoolean ? (
        <div className="flex items-center space-x-3 px-0.5 py-1">
          <Switch
            id={id}
            checked={!!value}
            onCheckedChange={(checked) => {
              if (onChange) onChange(checked);
            }}
            className="data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary"
          />
          <Label
            htmlFor={id}
            className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground/80"
          >
            {value ? 'Yes' : 'No'}
          </Label>
        </div>
      ) : isSelect ? (
        <Select
          value={value as string}
          onValueChange={(newValue) => {
            if (onChange) onChange(newValue);
          }}
        >
          <SelectTrigger
            id={id}
            className="h-9 rounded-md border-border/30 bg-background text-sm shadow-sm transition-all hover:border-border/50 focus:ring-primary/20"
          >
            <SelectValue placeholder={placeholder || `Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border/40 bg-background/95 p-[2%] shadow-lg backdrop-blur-sm">
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="rounded text-sm transition-colors hover:bg-accent/50 focus:bg-accent"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : isTextarea ? (
        <Textarea
          id={id}
          value={value as string}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="scrollbar-hide min-h-[200px] w-full resize-y rounded-md border-border/30 bg-background/80 p-[2%] text-sm shadow-sm transition-all placeholder:text-muted-foreground/60 hover:border-border/50 focus:border-primary/30 focus:ring-primary/20"
        />
      ) : (
        <Input
          id={id}
          type="text"
          value={(value as string) || ''}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="h-9 rounded-md border-border/30 bg-background/80 text-sm shadow-sm transition-all placeholder:text-muted-foreground/60 hover:border-border/50 focus:border-primary/30 focus:ring-primary/20"
        />
      )}
    </div>
  );
}
