import { DatePreset } from '@/components/data-table/types'
import { addDays, addHours, endOfDay, startOfDay } from 'date-fns'

/**
 * Predefined date range presets for date pickers and filters.
 * 
 * This array contains common date range presets that can be used in date pickers,
 * filter controls, and other UI components that require date range selection.
 * Each preset includes a human-readable label, the date range (from/to),
 * and a keyboard shortcut for quick access.
 * 
 * The presets include:
 * - Today
 * - Yesterday
 * - Last hour
 * - Last 7 days
 * - Last 14 days
 * - Last 30 days
 * 
 * These presets are particularly useful for financial reporting, analytics dashboards,
 * and other data visualization components where users need to quickly select common
 * time periods.
 * 
 * @example
 * // Using a preset in a date range picker
 * const DateRangePicker = () => {
 *   const [selectedRange, setSelectedRange] = useState(null);
 *   
 *   return (
 *     <div>
 *       <select onChange={(e) => {
 *         const preset = presets.find(p => p.label === e.target.value);
 *         if (preset) setSelectedRange({ from: preset.from, to: preset.to });
 *       }}>
 *         {presets.map(preset => (
 *           <option key={preset.label} value={preset.label}>
 *             {preset.label}
 *           </option>
 *         ))}
 *       </select>
 *     </div>
 *   );
 * };
 */
export const presets = [
  {
    label: 'Today',
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
    shortcut: 'd', // day
  },
  {
    label: 'Yesterday',
    from: startOfDay(addDays(new Date(), -1)),
    to: endOfDay(addDays(new Date(), -1)),
    shortcut: 'y',
  },
  {
    label: 'Last hour',
    from: addHours(new Date(), -1),
    to: new Date(),
    shortcut: 'h',
  },
  {
    label: 'Last 7 days',
    from: startOfDay(addDays(new Date(), -7)),
    to: endOfDay(new Date()),
    shortcut: 'w',
  },
  {
    label: 'Last 14 days',
    from: startOfDay(addDays(new Date(), -14)),
    to: endOfDay(new Date()),
    shortcut: 'b', // bi-weekly
  },
  {
    label: 'Last 30 days',
    from: startOfDay(addDays(new Date(), -30)),
    to: endOfDay(new Date()),
    shortcut: 'm',
  },
] satisfies DatePreset[]
