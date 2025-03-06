import type { ReactNode } from 'react';

import { cn } from '@udecode/cn';

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
  description?: string;
}

export function PageHeader({
  action,
  className,
  description,
  title,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center',
        className
      )}
    >
      <div>
        <h1 className="bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-2xl leading-tight font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground/90">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 ml-auto transition-all duration-200 hover:scale-[1.02] sm:mt-0">
          {action}
        </div>
      )}
    </div>
  );
}
