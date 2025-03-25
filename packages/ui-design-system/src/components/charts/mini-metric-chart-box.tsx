import {
  Card,
  CardContent,
  CardHeader,
} from '../card'

import { SchemasType } from './types'
import { formatCurrencyAndAmount } from './utils'

export interface MiniMetricBoxProps {
  title?: string
  metric?: SchemasType['Metric']
  value?: number
}

export const MiniMetricChartBox = ({
  title,
  metric,
  value,
}: MiniMetricBoxProps) => {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <span className="dark:text-polar-500 text-gray-500">
          {title ?? metric?.slug}
        </span>
      </CardHeader>
      <CardContent>
        <h3 className="text-2xl">
          {metric && (
            metric.type === 'scalar'
              ? Intl.NumberFormat('en-US', {
                notation: 'compact',
              }).format(value ?? 0)
              : formatCurrencyAndAmount(value ?? 0, 'USD', 0, 'compact')
          )}
        </h3>
      </CardContent>
    </Card>
  )
}
