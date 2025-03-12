/**
 * @file use-hot-key.ts
 * @description A custom React hook for handling keyboard shortcuts (hotkeys) in applications.
 */
import { useEffect } from "react";

/**
 * @hook useHotKey
 * @description Custom hook that registers a global keyboard shortcut (hotkey) combination.
 * The hotkey is triggered when the specified key is pressed along with either the Ctrl key (Windows/Linux)
 * or the Command/Meta key (macOS).
 * 
 * @param {Function} callback - The function to execute when the hotkey is triggered
 * @param {string} key - The key that, when pressed with Ctrl/Cmd, will trigger the callback
 * 
 * @example
 * ```tsx
 * // Create a Ctrl+S or Cmd+S save shortcut
 * const SaveButton = () => {
 *   const handleSave = () => {
 *     console.log('Saving document...');
 *     saveDocument();
 *   };
 *   
 *   // Register Ctrl+S or Cmd+S hotkey
 *   useHotKey(handleSave, 's');
 *   
 *   return <button onClick={handleSave}>Save</button>;
 * };
 * ```
 * 
 * @example
 * ```tsx
 * // Create a Ctrl+/ or Cmd+/ toggle shortcut
 * const SettingsPanel = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   
 *   const togglePanel = () => setIsOpen(!isOpen);
 *   
 *   // Register Ctrl+/ or Cmd+/ hotkey
 *   useHotKey(togglePanel, '/');
 *   
 *   return (
 *     <>
 *       <button onClick={togglePanel}>Settings</button>
 *       {isOpen && <div className="settings-panel">...</div>}
 *     </>
 *   );
 * };
 * ```
 */
export function useHotKey(callback: () => void, key: string): void {
  useEffect(() => {
    /**
     * Event handler for keydown events
     * Checks if the pressed key matches the target key and if Ctrl/Cmd is also pressed
     * 
     * @param {KeyboardEvent} e - The keyboard event
     */
    function handler(e: KeyboardEvent) {
      if (e.key === key && (e.metaKey || e.ctrlKey)) {
        // e.preventDefault();
        callback();
      }
    }

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [key]);
}
