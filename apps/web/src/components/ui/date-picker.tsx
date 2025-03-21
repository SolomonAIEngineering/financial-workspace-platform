'use client';

import * as React from 'react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/registry/default/potion-ui/popover';

import { Button } from '@/registry/default/potion-ui/button';
import { Calendar } from '@/registry/default/potion-ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface DatePickerProps {
    /**
     * The selected date
     */
    date?: Date;
    /**
     * Callback function when date changes
     */
    onDateChange: (date?: Date) => void;
    /**
     * Custom placeholder text
     */
    placeholder?: string;
    /**
     * Format to display the date (default: 'PPP' = 'Apr 29, 2023')
     */
    dateFormat?: string;
    /**
     * CSS class for the button
     */
    className?: string;
    /**
     * Optional disabled state
     */
    disabled?: boolean;
}

/**
 * DatePicker component
 * 
 * A simple date picker component that allows selecting a single date.
 * 
 * @example
 * ```tsx
 * const [date, setDate] = React.useState<Date | undefined>(new Date());
 * 
 * <DatePicker 
 *   date={date} 
 *   onDateChange={setDate} 
 *   placeholder="Select date" 
 * />
 * ```
 */
export function DatePicker({
    date,
    onDateChange,
    placeholder = "Select a date",
    dateFormat = "PPP",
    className,
    disabled = false,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // This ensures the date is properly handled
    const handleSelect = (selectedDate: Date | undefined) => {
        console.log("Date selected:", selectedDate);

        // Call the provided callback with the selected date
        onDateChange(selectedDate);

        // Close the popover after selection
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                    onClick={() => setOpen(true)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, dateFormat) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
} 