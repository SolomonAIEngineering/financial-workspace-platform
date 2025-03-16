/**
 * Team currency setting component
 *
 * @file Team Currency Setting Component
 */

import { Check, ChevronsUpDown, DollarSign } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/registry/default/potion-ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/potion-ui/popover';

import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TeamCurrencySettingProps } from '../../../types';
import { cn } from '@/lib/utils';
import { currencies } from '@/types/status';
import { getCurrencyInfo } from '../../../utils';
import { useState } from 'react';

/**
 * Component for managing a team's base currency setting
 *
 * Allows team owners to select from available currencies for financial
 * operations. Non-owners can view but not change the setting.
 *
 * @example
 *   ```tsx
 *   <TeamCurrencySetting
 *     baseCurrency={team.baseCurrency}
 *     isOwner={isOwner}
 *     onCurrencyUpdate={handleCurrencyUpdate}
 *     isUpdating={isUpdating}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.baseCurrency - Current base currency code
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onCurrencyUpdate - Handler for currency updates
 * @param props.isUpdating - Whether currency updates are in progress
 * @returns Component for managing team currency
 */
export function TeamCurrencySetting({
  baseCurrency,
  isOwner,
  onCurrencyUpdate,
  isUpdating,
}: TeamCurrencySettingProps) {
  const [open, setOpen] = useState(false);

  // Get currency display info
  const currentCurrency = getCurrencyInfo(baseCurrency || 'USD');

  /** Handles currency selection */
  const handleCurrencySelect = async (currencyCode: string) => {
    if (currencyCode === baseCurrency) {
      setOpen(false);
      return;
    }

    try {
      await onCurrencyUpdate(currencyCode);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  return (
    <div className="space-y-1">
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
        Base Currency
        <InfoTooltip
          description="The default currency used for all financial operations in this team."
          size="sm"
        />
      </h4>
      {isOwner ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-8 w-full justify-between bg-background/70 px-3 hover:bg-background/90"
              disabled={isUpdating}
            >
              <div className="flex items-center">
                <span className="mr-1 flex h-4 w-4 items-center justify-center text-xs">
                  {currentCurrency.symbol}
                </span>
                <span className="mr-1">{currentCurrency.code}</span>
                {isUpdating && (
                  <Icons.spinner className="ml-1 h-3 w-3 animate-spin" />
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search currency..." />
              <CommandEmpty>No currency found</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {currencies.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    value={currency.code}
                    onSelect={() => handleCurrencySelect(currency.code)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentCurrency.code === currency.code
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span className="mr-1">{currency.symbol}</span>
                    <span className="flex-1">{currency.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {currency.code}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <p className="flex items-center text-sm font-medium">
          <DollarSign className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
          {currentCurrency.symbol} {currentCurrency.code} -{' '}
          {currentCurrency.name}
        </p>
      )}
    </div>
  );
}
