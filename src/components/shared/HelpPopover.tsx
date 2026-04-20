import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { GLOSSARY, type GlossaryEntry } from '../../constants/glossary';
import { FormulaDisplay } from './FormulaDisplay';

interface HelpPopoverProps {
  glossaryKey: string;
}

export function HelpPopover({ glossaryKey }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const entry: GlossaryEntry | undefined = GLOSSARY[glossaryKey];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!entry) return null;

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] transition-colors duration-150 ml-1"
        aria-label={`Help: ${entry.term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="help-popover" style={{ bottom: '100%', left: 0, marginBottom: 6 }}>
          <div className="text-xs font-bold text-[var(--color-text)] mb-1">{entry.term}</div>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{entry.definition}</p>
          {entry.latex && (
            <div className="mt-2">
              <FormulaDisplay latex={entry.latex} block={false} />
            </div>
          )}
          {entry.relatedTerms && entry.relatedTerms.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {entry.relatedTerms.map((rt) => (
                <span
                  key={rt}
                  className="text-[9px] px-1.5 py-0.5 bg-[var(--color-bg-alt)] rounded-[4px] text-[var(--color-text-subtle)]"
                >
                  {GLOSSARY[rt]?.term || rt}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
