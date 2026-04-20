import { useEffect } from 'react';

type ShortcutMap = Record<string, () => void>;

export function useHotkeys(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      for (const [combo, fn] of Object.entries(shortcuts)) {
        const parts = combo.toLowerCase().split('+');
        const needsMod = parts.includes('mod');
        const shortcutKey = parts[parts.length - 1];

        if (needsMod && mod && key === shortcutKey) {
          e.preventDefault();
          fn();
          return;
        }
        if (!needsMod && key === shortcutKey && !mod) {
          e.preventDefault();
          fn();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
