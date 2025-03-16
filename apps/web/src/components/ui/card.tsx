'use client';

import { cva } from 'class-variance-authority';
import { withVariants } from '@udecode/cn';

const cardVariants = cva('rounded-2xl bg-card text-card-foreground border-2 border-gray-50 dark:border-gray-900', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      cv: 'flex flex-col overflow-hidden border border-border/70 p-3 ',
      cvRow: '',
      default: 'border shadow-xs border-2 border-gray-50 dark:border-gray-900',
    },
  },
});

export const Card = withVariants('div', cardVariants, ['variant']);

const cardHeaderVariants = cva('flex flex-col space-y-1', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      cv: '',
      default: 'p-6 border-2 border-gray-50 dark:border-gray-900',
    },
  },
});

export const CardHeader = withVariants('div', cardHeaderVariants, ['variant']);

const cardTitleVariants = cva('font-semibold leading-none tracking-tight', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      cv: 'text-base',
      default: 'text-lg',
    },
  },
});

export const CardTitle = withVariants('h3', cardTitleVariants, ['variant']);

const cardDescriptionVariants = cva('text-subtle-foreground', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: '',
    },
  },
});

export const CardDescription = withVariants('p', cardDescriptionVariants, [
  'variant',
]);

const cardContentVariants = cva('', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      cv: 'text-pretty text-subtle-foreground [font-family:var(--font-state)]',
      default: 'p-6 pt-0',
    },
  },
});

export const CardContent = withVariants('div', cardContentVariants, [
  'variant',
]);

const cardFooterVariants = cva('flex items-center', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      cv: '',
      default: 'p-6 pt-0',
    },
  },
});

export const CardFooter = withVariants('div', cardFooterVariants, ['variant']);
