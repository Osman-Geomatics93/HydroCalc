import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { PRESETS, type Preset } from '../../constants/presets';

interface PresetSelectorProps {
  calculatorId: string;
  onSelect: (values: Record<string, number | string>) => void;
}

export function PresetSelector({ calculatorId, onSelect }: PresetSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const presets = PRESETS[calculatorId];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!presets || presets.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-[6px] bg-transparent hover:bg-[var(--color-bg-alt)] transition-[background-color,border-color] duration-200 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        Load Example <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] shadow-[var(--shadow-md)] z-30 overflow-hidden">
          {presets.map((preset: Preset) => (
            <button
              key={preset.name}
              onClick={() => {
                onSelect(preset.values);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[var(--color-bg-alt)] transition-colors duration-100"
            >
              <div className="text-sm font-medium text-[var(--color-text)]">{preset.name}</div>
              <div className="text-xs text-[var(--color-text-subtle)]">{preset.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
