'use client';

import * as React from 'react';

import { Input } from '@/registry/default/potion-ui/input';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** The current amount value */
  value: number;
  /** Callback when amount changes */
  onChange: (value: number) => void;
  /** Currency code (default: USD) */
  currency?: string;
  /** CSS class for the input */
  className?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * CurrencyInput component
 *
 * A specialized input for handling currency values with proper formatting.
 *
 * @example
 *   ```tsx
 *   const [amount, setAmount] = React.useState(0);
 *
 *   <CurrencyInput
 *     value={amount}
 *     onChange={setAmount}
 *     currency="USD"
 *   />
 *   ```;
 */
export function CurrencyInput({
  value,
  onChange,
  currency = 'USD',
  className,
  disabled = false,
  placeholder = 'Enter amount',
  ...props
}: CurrencyInputProps) {
  // Format the numeric value for display
  const [displayValue, setDisplayValue] = React.useState<string>('');

  // Setup the currency formatter
  const formatter = React.useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [currency]);

  // Initialize display value from prop value
  React.useEffect(() => {
    // Don't update if input is focused to avoid cursor jumping
    if (document.activeElement !== document.getElementById('currency-input')) {
      // Remove currency symbol and formatting for input
      const numericValue = value || 0;
      setDisplayValue(numericValue.toString());
    }
  }, [value]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow only numbers and a single decimal point
    const sanitized = input.replace(/[^0-9.]/g, '');

    // Validate decimal format (only one decimal point)
    const decimalCount = (sanitized.match(/\./g) || []).length;
    if (decimalCount > 1) return;

    // Update the display value
    setDisplayValue(sanitized);

    // Convert to a number and call onChange
    const numericValue = parseFloat(sanitized) || 0;
    onChange(numericValue);
  };

  // Format for display when input loses focus
  const handleBlur = () => {
    // Parse value and ensure it's a number
    const numericValue = parseFloat(displayValue) || 0;

    // Format the value for display
    const formatted = formatter.format(numericValue);

    // Ensure the numeric value is passed to parent
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
        {currency === 'USD' ? '$' : currency}
      </span>
      <Input
        id="currency-input"
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={cn('pl-8', className)}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}
