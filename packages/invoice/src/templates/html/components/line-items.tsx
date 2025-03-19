import { formatAmount } from '@solomonai/utils'
import type { LineItem } from '../../../templates/types'
import { calculateLineItemTotal } from '../../../utils/calculate'
import { Description } from './description'

type Props = {
  lineItems: LineItem[]
  currency: string
  descriptionLabel: string
  quantityLabel: string
  priceLabel: string
  totalLabel: string
  includeDecimals?: boolean
  locale: string
  includeUnits?: boolean
}

export function LineItems({
  lineItems,
  currency,
  descriptionLabel,
  quantityLabel,
  priceLabel,
  totalLabel,
  includeDecimals = false,
  includeUnits = false,
  locale,
}: Props) {
  const maximumFractionDigits = includeDecimals ? 2 : 0

  return (
    <div className="mt-5 font-mono">
      <div className="border-border group relative mb-2 grid w-full grid-cols-[1.5fr_15%_15%_15%] items-end gap-4 border-b pb-1">
        <div className="text-[11px] text-[#878787]">{descriptionLabel}</div>
        <div className="text-[11px] text-[#878787]">{quantityLabel}</div>
        <div className="text-[11px] text-[#878787]">{priceLabel}</div>
        <div className="text-right text-[11px] text-[#878787]">
          {totalLabel}
        </div>
      </div>

      {lineItems.map((item, index) => (
        <div
          key={`line-item-${index.toString()}`}
          className="group relative mb-1 grid w-full grid-cols-[1.5fr_15%_15%_15%] items-start gap-4 py-1"
        >
          <div className="self-start">
            <Description content={item.name} />
          </div>
          <div className="self-start text-[11px]">{item.quantity}</div>
          <div className="self-start text-[11px]">
            {includeUnits && item.unit
              ? `${formatAmount({
                  currency,
                  amount: item.price,
                  maximumFractionDigits,
                  locale,
                })}/${item.unit}`
              : formatAmount({
                  currency,
                  amount: item.price,
                  maximumFractionDigits,
                  locale,
                })}
          </div>
          <div className="self-start text-right text-[11px]">
            {formatAmount({
              maximumFractionDigits,
              currency,
              amount: calculateLineItemTotal({
                price: item.price,
                quantity: item.quantity,
              }),
              locale,
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
