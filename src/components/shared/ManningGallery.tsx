import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { MANNING_TABLE, type ManningEntry } from '../../constants/manning';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ManningGalleryProps {
  onSelect: (n: number) => void;
  onClose: () => void;
}

type Category = 'Artificial' | 'Excavated' | 'Natural';

function categorize(material: string): Category {
  if (/glass|brass|steel|cast iron|concrete|brick|asphalt|corrugated/i.test(material)) return 'Artificial';
  if (/earth|gravel/i.test(material)) return 'Excavated';
  return 'Natural';
}

const SWATCH_COLORS: Record<Category, string> = {
  Artificial: '#64748b',
  Excavated: '#a16207',
  Natural: '#15803d',
};

const MATERIAL_COLORS: Record<string, string> = {
  Glass: '#93c5fd',
  Brass: '#fbbf24',
  'Steel (smooth)': '#94a3b8',
  'Steel (painted)': '#6b7280',
  'Steel (riveted)': '#4b5563',
  'Cast iron': '#374151',
  'Concrete (finished)': '#d1d5db',
  'Concrete (unfinished)': '#9ca3af',
  'Concrete (gunite)': '#6b7280',
  Brick: '#dc2626',
  Asphalt: '#1f2937',
  'Corrugated metal': '#71717a',
  'Earth (clean)': '#a16207',
  'Earth (weedy)': '#65a30d',
  'Earth (stony)': '#78716c',
  Gravel: '#a8a29e',
  'Natural stream (clean)': '#22c55e',
  'Natural stream (weedy)': '#16a34a',
  'Floodplain (pasture)': '#84cc16',
  'Floodplain (trees)': '#166534',
};

export function ManningGallery({ onSelect, onClose }: ManningGalleryProps) {
  const [search, setSearch] = useState('');
  const trapRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filtered = MANNING_TABLE.filter((e) =>
    e.material.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<Category, ManningEntry[]>>((acc, entry) => {
    const cat = categorize(entry.material);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {} as Record<Category, ManningEntry[]>);

  const categories: Category[] = ['Artificial', 'Excavated', 'Natural'];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Manning's n Materials"
        className="bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-[var(--color-text)]">Manning's n Materials</h2>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-subtle)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials..."
              className="w-full pl-9 pr-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {categories.map((cat) => {
            const entries = grouped[cat];
            if (!entries || entries.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: SWATCH_COLORS[cat] }}>
                  {cat}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {entries.map((entry) => (
                    <button
                      key={entry.material}
                      onClick={() => { onSelect(entry.nTypical); onClose(); }}
                      className="flex items-center gap-3 p-3 rounded-[6px] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded shrink-0"
                        style={{ backgroundColor: MATERIAL_COLORS[entry.material] || SWATCH_COLORS[cat] }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--color-text)] truncate">{entry.material}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          n = {entry.nTypical} ({entry.nMin}–{entry.nMax})
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
