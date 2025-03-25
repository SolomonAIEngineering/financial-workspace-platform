import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../select'

import { SchemasType } from './types'

// Define enums for interval selection
const enums = {
    timeIntervalValues: {
        HOUR: 'hour',
        DAY: 'day',
        WEEK: 'week',
        MONTH: 'month',
        YEAR: 'year'
    } as const
}

const getIntervalLabel = (interval: SchemasType['TimeInterval']) => {
    switch (interval) {
        case 'hour':
            return 'Hourly'
        case 'day':
            return 'Daily'
        case 'week':
            return 'Weekly'
        case 'month':
            return 'Monthly'
        case 'year':
            return 'Yearly'
    }
}

interface IntervalPickerProps {
    interval: SchemasType['TimeInterval']
    onChange: (interval: SchemasType['TimeInterval']) => void
}

const IntervalPicker: React.FC<IntervalPickerProps> = ({
    interval,
    onChange,
}) => {
    return (
        <Select value={interval} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder="Select an interval" />
            </SelectTrigger>
            <SelectContent>
                {(Object.values(enums.timeIntervalValues) as SchemasType['TimeInterval'][]).map((interval) => (
                    <SelectItem value={interval} key={interval} className="font-medium">
                        {getIntervalLabel(interval)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default IntervalPicker