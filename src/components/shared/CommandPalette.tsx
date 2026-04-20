import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useUnits } from '../../context/UnitContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useFavorites } from '../../hooks/useFavorites';

interface PaletteItem {
  id: string;
  label: string;
  chapter?: string;
  path?: string;
  action?: () => void;
  shortcut?: string;
}

const NAV_ITEMS: PaletteItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'ch1-geometry', label: 'Channel Geometry', chapter: 'Ch 1', path: '/ch1/geometry' },
  { id: 'ch1-froude', label: 'Froude Number', chapter: 'Ch 1', path: '/ch1/froude' },
  { id: 'ch2-energy', label: 'Specific Energy (E-y)', chapter: 'Ch 2', path: '/ch2/energy' },
  { id: 'ch2-critical', label: 'Critical Depth', chapter: 'Ch 2', path: '/ch2/critical-depth' },
  { id: 'ch2-alternate', label: 'Alternate Depths', chapter: 'Ch 2', path: '/ch2/alternate-depths' },
  { id: 'ch2-obstructions', label: 'Channel Obstructions', chapter: 'Ch 2', path: '/ch2/obstructions' },
  { id: 'ch3-momentum', label: 'Momentum Function (M-y)', chapter: 'Ch 3', path: '/ch3/momentum' },
  { id: 'ch3-jump', label: 'Hydraulic Jump', chapter: 'Ch 3', path: '/ch3/hydraulic-jump' },
  { id: 'ch3-combined', label: 'Combined Problems', chapter: 'Ch 3', path: '/ch3/combined' },
  { id: 'ch4-manning', label: "Manning's Equation", chapter: 'Ch 4', path: '/ch4/manning' },
  { id: 'ch4-normal', label: 'Normal Depth', chapter: 'Ch 4', path: '/ch4/normal-depth' },
  { id: 'ch4-class', label: 'Reach Classification', chapter: 'Ch 4', path: '/ch4/classification' },
  { id: 'ch5-taxonomy', label: 'Profile Taxonomy', chapter: 'Ch 5', path: '/ch5/taxonomy' },
  { id: 'ch5-composite', label: 'Composite Profiles', chapter: 'Ch 5', path: '/ch5/composite' },
  { id: 'ch6-step', label: 'Standard Step Method', chapter: 'Ch 6', path: '/ch6/standard-step' },
  { id: 'ch6-profiles', label: 'Water Surface Profiles', chapter: 'Ch 6', path: '/ch6/profiles' },
  { id: 'ch7-fall', label: 'Fall Velocity', chapter: 'Ch 7', path: '/ch7/fall-velocity' },
  { id: 'ch7-shields', label: 'Shields Diagram', chapter: 'Ch 7', path: '/ch7/shields' },
  { id: 'ch7-bedload', label: 'Bed Load Transport', chapter: 'Ch 7', path: '/ch7/bed-load' },
  { id: 'reference', label: 'Reference Formulas', path: '/reference' },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toggleUnits, units } = useUnits();
  const { toggleTheme, isDark } = useTheme();
  const [recentIds, setRecentIds] = useLocalStorage<string[]>('hydro-recent', []);
  const { favorites } = useFavorites();

  const actionItems: PaletteItem[] = [
    { id: 'action-units', label: `Toggle Units (${units})`, action: toggleUnits, shortcut: 'Ctrl+U' },
    { id: 'action-theme', label: `Toggle ${isDark ? 'Light' : 'Dark'} Mode`, action: toggleTheme, shortcut: 'Ctrl+J' },
  ];

  const allItems = [...NAV_ITEMS, ...actionItems];

  // Map favorites paths to item IDs
  const favoriteIds = new Set(
    NAV_ITEMS.filter((item) => item.path && favorites.includes(item.path)).map((item) => item.id)
  );

  const filtered = query.trim()
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        (item.chapter && item.chapter.toLowerCase().includes(query.toLowerCase()))
      )
    : (() => {
        // Show favorites first, then recent, then all
        const favs = allItems.filter((item) => favoriteIds.has(item.id));
        const recent = recentIds
          .map((id) => allItems.find((item) => item.id === id))
          .filter((item) => item && !favoriteIds.has(item.id)) as PaletteItem[];
        const rest = allItems.filter((item) => !favoriteIds.has(item.id) && !recentIds.includes(item.id));
        return [...favs, ...recent, ...rest];
      })();

  const select = useCallback((item: PaletteItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    setRecentIds((prev) => [item.id, ...prev.filter((id) => id !== item.id)].slice(0, 5));
    onClose();
  }, [navigate, onClose, setRecentIds]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selected]) select(filtered[selected]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selected, filtered, select, onClose]);

  // Reset selection when results change
  useEffect(() => {
    setSelected(0);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] shadow-[var(--shadow-lg)] w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-[var(--color-text-subtle)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search calculators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] text-sm"
          />
          <kbd className="text-[10px] text-[var(--color-text-subtle)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">esc</kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[var(--color-text-subtle)]">No results</div>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => select(item)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-[6px] transition-colors duration-100 ${
                i === selected
                  ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
              }`}
            >
              {item.chapter && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)] w-10 shrink-0">{item.chapter}</span>
              )}
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <kbd className="text-[10px] text-[var(--color-text-subtle)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">{item.shortcut}</kbd>
              )}
              {favoriteIds.has(item.id) && !query && (
                <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
              )}
              {recentIds.includes(item.id) && !favoriteIds.has(item.id) && !query && (
                <span className="text-[10px] text-[var(--color-text-subtle)]">recent</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
