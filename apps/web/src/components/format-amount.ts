'use client';

import { formatAmount } from '@/lib/utils';

type Props = {
  amount: number;
  currency: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  locale?: string;
};

/**
 * Formats an amount into a currency string
 *
 * @param amount - The amount to format
 * @param currency - The currency code
 * @param maximumFractionDigits - The maximum number of fraction digits
 * @param minimumFractionDigits - The minimum number of fraction digits
 * @param locale - The locale to format the amount in
 * @returns The formatted amount
 */
export function FormatAmount({
  amount,
  currency,
  maximumFractionDigits,
  minimumFractionDigits,
  locale,
}: Props) {
  return formatAmount({
    amount: amount,
    currency: currency,
    maximumFractionDigits,
    minimumFractionDigits,
  });
}
