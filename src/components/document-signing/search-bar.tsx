'use client';

import React from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  placeholder = 'Search documents or senders...',
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        className="block w-full rounded-md border border-input bg-background py-1.5 pr-3 pl-10 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
}
