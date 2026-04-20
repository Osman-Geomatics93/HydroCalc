import { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, X, Calculator } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface ConversionCategory {
  name: string;
  units: { label: string; factor: number }[];
}

const CATEGORIES: ConversionCategory[] = [
  {
    name: 'Length',
    units: [
      { label: 'm', factor: 1 },
      { label: 'ft', factor: 3.28084 },
      { label: 'cm', factor: 100 },
      { label: 'in', factor: 39.3701 },
      { label: 'mm', factor: 1000 },
    ],
  },
  {
    name: 'Velocity',
    units: [
      { label: 'm/s', factor: 1 },
      { label: 'ft/s', factor: 3.28084 },
      { label: 'km/h', factor: 3.6 },
      { label: 'mph', factor: 2.23694 },
    ],
  },
  {
    name: 'Discharge',
    units: [
      { label: 'm\u00b3/s', factor: 1 },
      { label: 'ft\u00b3/s', factor: 35.3147 },
      { label: 'L/s', factor: 1000 },
      { label: 'gal/min', factor: 15850.3 },
    ],
  },
  {
    name: 'Area',
    units: [
      { label: 'm\u00b2', factor: 1 },
      { label: 'ft\u00b2', factor: 10.7639 },
      { label: 'cm\u00b2', factor: 10000 },
    ],
  },
  {
    name: 'Pressure',
    units: [
      { label: 'Pa', factor: 1 },
      { label: 'N/m\u00b2', factor: 1 },
      { label: 'lb/ft\u00b2', factor: 0.020886 },
      { label: 'kPa', factor: 0.001 },
    ],
  },
];

export function QuickConverter() {
  const [isOpen, setIsOpen] = useLocalStorage('hydro-converter-open', false);
  const [catIdx, setCatIdx] = useState(0);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [inputVal, setInputVal] = useState('');
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const cat = CATEGORIES[catIdx];
  const fromFactor = cat.units[fromIdx]?.factor || 1;
  const toFactor = cat.units[toIdx]?.factor || 1;
  const num = parseFloat(inputVal) || 0;
  const converted = (num / fromFactor) * toFactor;

  const swap = () => { setFromIdx(toIdx); setToIdx(fromIdx); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT' || (e.target as HTMLElement).tagName === 'BUTTON') return;
    dragging.current = true;
    const rect = ref.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    const handleUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, []);

  const style = pos.x >= 0 ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : { right: 20, bottom: 80 };

  return (
    <div className="fixed z-30 no-print" style={style} ref={ref}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
          title="Quick Unit Converter"
        >
          <Calculator className="w-5 h-5" />
        </button>
      ) : (
        <div
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-lg)] w-64 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Unit Converter</span>
            <button onClick={() => setIsOpen(false)} className="p-0.5 text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 space-y-2">
            <select
              value={catIdx}
              onChange={(e) => { setCatIdx(+e.target.value); setFromIdx(0); setToIdx(1); }}
              className="w-full px-2 py-1 border rounded text-xs bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]"
            >
              {CATEGORIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
            </select>

            <div className="flex items-center gap-1">
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-xs bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
                placeholder="0"
              />
              <select
                value={fromIdx}
                onChange={(e) => setFromIdx(+e.target.value)}
                className="w-20 px-1 py-1 border rounded text-xs bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]"
              >
                {cat.units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
              </select>
            </div>

            <div className="flex justify-center">
              <button onClick={swap} className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-accent)]">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex-1 px-2 py-1 border rounded text-xs bg-[var(--color-bg-alt)] text-[var(--color-text)] border-[var(--color-border)] font-medium">
                {num === 0 ? '—' : converted.toPrecision(6)}
              </div>
              <select
                value={toIdx}
                onChange={(e) => setToIdx(+e.target.value)}
                className="w-20 px-1 py-1 border rounded text-xs bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]"
              >
                {cat.units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
