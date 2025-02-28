'use client';

import type { ReactNode } from 'react';

import { cn } from '@udecode/cn';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';

export interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  contentClassName?: string;
  description?: string;
  footer?: ReactNode;
  icon?: ReactNode;
  preventClickOutside?: boolean;
  showCloseButton?: boolean;
  size?: '2xl' | '3xl' | '4xl' | 'lg' | 'md' | 'none' | 'sm' | 'xl' | 'xs';
  subtitle?: string;
  title?: string;
}

export function Modal({
  children,
  className,
  contentClassName,
  description,
  footer,
  icon,
  isOpen,
  preventClickOutside = false,
  showCloseButton = true,
  size = '4xl',
  subtitle,
  title,
  onClose,
}: ModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open && !preventClickOutside) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size={size}
        className={cn(
          // Override max-width and max-height to be exactly 80% of viewport
          'hide-scrollbar !h-[80vh] !max-h-[80vh] !w-[80%] !max-w-[80%]',
          className
        )}
        hideClose={!showCloseButton}
      >
        {(title || subtitle || description || icon) && (
          <DialogHeader>
            {title && (
              <DialogTitle className={icon ? 'flex items-center gap-3' : ''}>
                {icon && icon}
                {title}
              </DialogTitle>
            )}
            {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </DialogHeader>
        )}

        <DialogBody className={cn('flex-1 overflow-auto', contentClassName)}>
          {children}
        </DialogBody>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
