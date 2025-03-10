'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/registry/default/potion-ui/command';
import {
  Popover,
  PopoverContentWithoutPortal,
  PopoverTrigger,
} from '@/registry/default/potion-ui/popover';
import React, { useEffect } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import countries from '@solomonai/location/country-flags';

interface CountrySelectorProps {
  defaultValue: string;
  onSelect: (countryCode: string, countryName: string) => void;
}

/**
 * CountryFlag Component
 *
 * Displays a country flag emoji based on country code.
 */
function CountryFlag({
  countryCode,
  className = '',
}: {
  countryCode: string;
  className?: string;
}) {
  // Convert country code to flag emoji
  // Each country code letter is converted to a regional indicator symbol emoji
  const flagEmoji = countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join('');

  return <span className={className}>{flagEmoji}</span>;
}

/**
 * CountrySelector Component
 *
 * Dropdown for selecting a country when connecting bank accounts.
 */
export function CountrySelector({
  defaultValue,
  onSelect,
}: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);

  useEffect(() => {
    if (value !== defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, value]);

  const selected = Object.values(countries).find(
    (country) => country.code === value || country.name === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-full justify-between truncate bg-accent font-normal"
        >
          {value ? selected?.name : 'Select country'}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-30" />
        </Button>
      </PopoverTrigger>
      <PopoverContentWithoutPortal className="w-[225px] p-0 rounded-2xl border-2 border-zinc-200">
        <Command>
          <CommandInput placeholder="Search country..." className="h-9 px-2" />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[230px] overflow-y-auto pt-2">
            {Object.values(countries).map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={() => {
                  setValue(country.code);
                  onSelect?.(country.code, country.name);
                  setOpen(false);
                }}
              >
                {country.name}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === country.code ? 'opacity-30' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContentWithoutPortal>
    </Popover>
  );
}
