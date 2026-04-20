import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, StickyNote } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface NotesPanelProps {
  calculatorId: string;
}

export function NotesPanel({ calculatorId }: NotesPanelProps) {
  const [note, setNote] = useLocalStorage(`hydro-notes-${calculatorId}`, '');
  const [open, setOpen] = useState(false);
  const [showClear, setShowClear] = useState(false);

  const handleClear = () => {
    setNote('');
    setShowClear(false);
  };

  return (
    <div className="no-print">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <StickyNote className="w-3.5 h-3.5" />
        Notes
        {!open && note && <span className="text-xs text-[var(--color-text-subtle)] truncate max-w-[200px]">{note.slice(0, 40)}...</span>}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add notes for this calculator..."
            rows={4}
            className="w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] outline-none focus:border-[var(--color-accent)] resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--color-text-subtle)]">{note.length} characters</span>
            {note && (
              showClear ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--color-text-muted)]">Clear notes?</span>
                  <button onClick={handleClear} className="text-red-600 hover:underline">Yes</button>
                  <button onClick={() => setShowClear(false)} className="text-[var(--color-text-muted)] hover:underline">No</button>
                </div>
              ) : (
                <button onClick={() => setShowClear(true)} className="flex items-center gap-1 text-xs text-[var(--color-text-subtle)] hover:text-red-500">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
