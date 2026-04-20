import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useUnits } from '../../context/UnitContext';
import { CopyFormatMenu } from './CopyFormatMenu';

interface ResultCardProps {
  label: string;
  value: number | string;
  unit?: string;
  highlight?: boolean;
}

/** Conversion factors from SI to US */
const CONVERSIONS: Record<string, { factor: number; siUnit: string; usUnit: string }> = {
  m: { factor: 3.28084, siUnit: 'm', usUnit: 'ft' },
  ft: { factor: 1 / 3.28084, siUnit: 'm', usUnit: 'ft' },
  'm/s': { factor: 3.28084, siUnit: 'm/s', usUnit: 'ft/s' },
  'ft/s': { factor: 1 / 3.28084, siUnit: 'm/s', usUnit: 'ft/s' },
  'm\u00b2': { factor: 10.7639, siUnit: 'm\u00b2', usUnit: 'ft\u00b2' },
  'ft\u00b2': { factor: 1 / 10.7639, siUnit: 'm\u00b2', usUnit: 'ft\u00b2' },
  'm\u00b3/s': { factor: 35.3147, siUnit: 'm\u00b3/s', usUnit: 'ft\u00b3/s' },
  'ft\u00b3/s': { factor: 1 / 35.3147, siUnit: 'm\u00b3/s', usUnit: 'ft\u00b3/s' },
};

export function ResultCard({ label, value, unit, highlight }: ResultCardProps) {
  const formatted = typeof value === 'number' ? value.toFixed(4) : value;
  const toast = useToast();
  const { units } = useUnits();
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const conversion = useMemo(() => {
    if (typeof value !== 'number' || !unit) return null;
    const conv = CONVERSIONS[unit];
    if (!conv) return null;
    const converted = value * conv.factor;
    const targetUnit = units === 'SI' ? conv.usUnit : conv.siUnit;
    return { value: converted, unit: targetUnit };
  }, [value, unit, units]);

  const handleCopy = async () => {
    const text = unit ? `${formatted} ${unit}` : String(formatted);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`Copied: ${text}`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopy(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onContextMenu={handleContextMenu}
      className={`group relative rounded-[6px] border p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-sm)] cursor-pointer select-none ${
        copied ? 'copy-flash' : ''
      } ${
        highlight
          ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent-bg)]'
          : 'bg-[var(--color-surface)] border-[var(--color-border)]'
      }`}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[var(--color-text-subtle)]">
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
        {formatted}
        {unit && <span className="text-sm font-normal text-[var(--color-text-subtle)] ml-1">{unit}</span>}
      </div>
      {conversion && hovered && (
        <div className="mt-0.5 text-[11px] text-[var(--color-text-subtle)]">
          = {conversion.value.toFixed(4)} {conversion.unit}
        </div>
      )}
      {contextMenu && (
        <CopyFormatMenu
          value={value}
          unit={unit}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
