import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for conditionally joining CSS class names together.
 * 
 * This function combines the functionality of clsx and tailwind-merge to provide
 * a convenient way to conditionally apply Tailwind CSS classes while properly
 * handling class conflicts and merging.
 * 
 * @param inputs - Any number of class values to be conditionally joined
 * @returns A string of merged class names with Tailwind conflicts resolved
 * 
 * @example
 * // Basic usage
 * cn('px-2', 'py-1', 'bg-red-500')
 * // => 'px-2 py-1 bg-red-500'
 * 
 * @example
 * // With conditional classes
 * cn('px-2', isActive && 'bg-blue-500', !isActive && 'bg-gray-200')
 * // => 'px-2 bg-blue-500' or 'px-2 bg-gray-200' depending on isActive
 * 
 * @example
 * // With class name conflicts (tailwind-merge handles this)
 * cn('px-2', 'px-4')
 * // => 'px-4' (the later class overrides the earlier one)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
