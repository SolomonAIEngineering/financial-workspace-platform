/**
 * A reusable form field component for profile forms
 *
 * @file Profile Form Field Component
 */

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Input } from '@/registry/default/potion-ui/input';
import type { ProfileFormFieldProps } from '../types/profile-types';
import { ReactNode } from 'react';
import { Textarea } from '@/registry/default/potion-ui/textarea';

/**
 * A reusable form field component that handles various types of inputs with
 * integrated help tooltips for better user guidance.
 *
 * @example
 *   <ProfileFormField
 *     control={form.control}
 *     name="email"
 *     label="Email Address"
 *     placeholder="Enter your email"
 *     description="Your primary email for account notifications."
 *     tooltipDescription="This email is used for important account notifications and cannot be disabled for security purposes."
 *     icon={<Icons.email />}
 *   />;
 *
 * @param props - Component props
 * @returns A form field component with consistent styling and behavior
 */
export function ProfileFormField({
  control,
  description,
  tooltipDescription,
  icon,
  label,
  name,
  placeholder,
  type = 'text',
}: ProfileFormFieldProps) {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="flex items-center gap-2 text-sm font-medium">
            {icon as ReactNode}
            {label}
            {tooltipDescription && (
              <InfoTooltip
                title={label}
                description={tooltipDescription || description || ''}
                size="sm"
              />
            )}
          </FormLabel>
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                className="min-h-[120px] resize-none rounded-lg border border-muted/20 bg-muted/5 transition-all duration-200 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                placeholder={placeholder}
                {...field}
                value={field.value || ''}
              />
            ) : (
              <Input
                className="h-11 rounded-lg border border-muted/20 bg-muted/5 transition-all duration-200 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                placeholder={placeholder}
                {...field}
                value={field.value || ''}
              />
            )}
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-muted-foreground/80">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
