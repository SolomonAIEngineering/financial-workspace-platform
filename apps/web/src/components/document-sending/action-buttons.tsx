'use client';

import React from 'react';

import {
  ArrowUpTrayIcon,
  FunnelIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@udecode/cn';
import { motion } from 'framer-motion';

interface ButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  size?: 'lg' | 'md' | 'sm';
  variant?: 'ghost' | 'outline' | 'primary';
}

export function ActionButton({
  className,
  icon,
  label,
  size = 'md',
  variant = 'outline',
  onClick,
}: ButtonProps) {
  const sizeClasses = {
    lg: 'px-4 py-2.5 text-sm',
    md: 'px-3 py-2 text-sm',
    sm: 'px-2.5 py-1.5 text-xs',
  };

  const variantClasses = {
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  };

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

export function DocumentSendingActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ActionButton
        variant="primary"
        onClick={() => {}}
        label="New Document"
        icon={<PlusIcon className="h-4 w-4" />}
      />
      <ActionButton
        variant="outline"
        onClick={() => {}}
        label="Import"
        icon={<ArrowUpTrayIcon className="h-4 w-4" />}
      />
      <ActionButton
        size="sm"
        variant="ghost"
        onClick={() => {}}
        label="Filter"
        icon={<FunnelIcon className="h-4 w-4" />}
      />
    </div>
  );
}
