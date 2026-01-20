/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcut functionality
 */

import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const isModifier = ctrlKey || metaKey;

      shortcuts.forEach(({ keys, ctrl = false, shift = false, alt = false, handler }) => {
        const keyMatches = keys.toLowerCase() === key.toLowerCase();
        const modifiersMatch = 
          (ctrl ? isModifier : !isModifier) &&
          (shift ? shiftKey : !shiftKey) &&
          (alt ? altKey : !altKey);

        if (keyMatches && modifiersMatch) {
          event.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export default useKeyboardShortcuts;
