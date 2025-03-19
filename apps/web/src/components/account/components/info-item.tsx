/**
 * A component for displaying a single item of account information with an icon
 * and optional verification badge
 *
 * @file InfoItem Component
 */

'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { Icons } from '@/components/ui/icons';
import type { InfoItemProps } from '../types/account-types';
import { Label } from '@/components/ui/label';

/**
 * Enhanced InfoItem component with verification badge option and modern styling
 *
 * @example
 *   <InfoItem
 *     label="Email"
 *     value="user@example.com"
 *     icon={<Icons.message className="size-4 text-primary/60" />}
 *     verified={true}
 *   />;
 *
 * @param props - Component props
 * @param props.label - The label text for this information item
 * @param props.value - The value to display
 * @param props.icon - React node for the icon to display
 * @param props.verified - Whether the item is verified (shows a verification
 *   badge)
 * @returns A styled information item with label, value, icon and optional
 *   verification badge
 * @component
 */
export function InfoItem({ icon, label, value, verified }: InfoItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-muted/20 bg-gradient-to-r from-muted/5 to-background p-4 transition-all duration-200 hover:border-muted/30 hover:bg-muted/10 hover:shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
        {icon}
      </div>
      <div className="flex-1">
        <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </Label>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-sm font-medium">{value}</div>
          {verified !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="fade-in animate-in duration-300">
                    {verified ? (
                      <div className="rounded-full bg-green-100 p-1 text-green-600">
                        <Icons.check className="size-3" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-amber-100 p-1 text-amber-600">
                        <Icons.alertCircle className="size-3" />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="border border-muted/20 bg-background shadow-md">
                  <p className="text-xs font-medium">
                    {verified ? 'Verified' : 'Not verified'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
