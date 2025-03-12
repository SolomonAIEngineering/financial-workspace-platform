"use client";

/**
 * @file use-local-storage.ts
 * @description A custom React hook for persisting state in localStorage with type safety.
 */
import { useCallback, useEffect, useState } from "react";

/**
 * Helper function to retrieve and parse an item from localStorage
 * 
 * @param {string} key - The localStorage key to retrieve
 * @returns {any | null} - The parsed value from localStorage or null if not found
 */
function getItemFromLocalStorage(key: string) {
  const item = window?.localStorage.getItem(key);
  if (item) return JSON.parse(item);

  return null;
}

/**
 * @hook useLocalStorage
 * @description A custom hook that provides persistent state using localStorage.
 * Works similarly to useState but persists the state to localStorage so it survives page refreshes.
 * The hook is type-safe and handles serialization/deserialization of stored values.
 * 
 * @template T - The type of the stored value
 * @param {string} key - The key to use for storing in localStorage
 * @param {T} initialValue - The initial value to use if no value exists in localStorage
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} - A stateful value and a function to update it,
 *                                                          similar to React.useState
 * 
 * @example
 * ```tsx
 * // Basic usage with primitive value
 * const ProfileSettings = () => {
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 *   
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *         Toggle Theme
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 * 
 * @example
 * ```tsx
 * // Using with complex objects
 * const UserPreferences = () => {
 *   const [preferences, setPreferences] = useLocalStorage('user-prefs', {
 *     notifications: true,
 *     fontSize: 'medium',
 *     colorScheme: 'auto'
 *   });
 *   
 *   const toggleNotifications = () => {
 *     setPreferences(prev => ({
 *       ...prev,
 *       notifications: !prev.notifications
 *     }));
 *   };
 *   
 *   return (
 *     <div>
 *       <h2>User Preferences</h2>
 *       <label>
 *         <input
 *           type="checkbox"
 *           checked={preferences.notifications}
 *           onChange={toggleNotifications}
 *         />
 *         Enable Notifications
 *       </label>
 *     </div>
 *   );
 * };
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    // initialize
    if (typeof window !== "undefined") {
      const stored = getItemFromLocalStorage(key);
      if (stored !== null) setStoredValue(stored);
    }
  }, [key]);

  /**
   * Custom setter function that updates both the React state and localStorage
   */
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value) => {
      if (value instanceof Function) {
        setStoredValue((prev: T) => {
          const newValue = value(prev);
          // Save to localStorage
          window.localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      } else {
        setStoredValue(value);
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(value));
      }
      return setStoredValue;
    },
    [key, setStoredValue],
  );

  return [storedValue, setValue];
}
