import { X, Trash2, Clock } from 'lucide-react';
import { useHistory, type HistoryEntry } from '../../hooks/useHistory';
import { useNavigate } from 'react-router-dom';

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

// Map calculator IDs to routes
const CALC_ROUTES: Record<string, string> = {
  'ch1-geometry': '/ch1/geometry',
  'ch1-froude': '/ch1/froude',
  'ch2-energy': '/ch2/energy',
  'ch2-critical': '/ch2/critical-depth',
  'ch2-alternate': '/ch2/alternate-depths',
  'ch2-obstructions': '/ch2/obstructions',
  'ch3-momentum': '/ch3/momentum',
  'ch3-jump': '/ch3/hydraulic-jump',
  'ch3-combined': '/ch3/combined',
  'ch4-manning': '/ch4/manning',
  'ch4-normal': '/ch4/normal-depth',
  'ch4-classification': '/ch4/classification',
  'ch5-taxonomy': '/ch5/taxonomy',
  'ch5-composite': '/ch5/composite',
  'ch6-step': '/ch6/standard-step',
  'ch6-profiles': '/ch6/profiles',
  'ch6-multireach': '/ch6/multi-reach',
  'ch7-fall': '/ch7/fall-velocity',
  'ch7-shields': '/ch7/shields',
  'ch7-bedload': '/ch7/bed-load',
};

function groupByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const groups: Record<string, HistoryEntry[]> = {};
  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    const key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

export function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const { history, clearHistory } = useHistory();
  const navigate = useNavigate();

  if (!open) return null;

  const handleClick = (entry: HistoryEntry) => {
    const route = CALC_ROUTES[entry.calculatorId];
    if (!route) return;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(entry.inputs)) {
      params.set(k, String(v));
    }
    navigate(`${route}?${params.toString()}`);
    onClose();
  };

  const groups = groupByDate(history);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="absolute right-0 top-0 bottom-0 w-96 max-w-full bg-[var(--color-surface)] shadow-[var(--shadow-lg)] flex flex-col history-panel-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-accent)]" />
            <h2 className="text-sm font-bold text-[var(--color-text)]">Calculation History</h2>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={() => { if (confirm('Clear all history?')) clearHistory(); }}
                className="p-1.5 text-[var(--color-text-subtle)] hover:text-red-500 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-sm text-[var(--color-text-subtle)]">
              No calculations yet
            </div>
          ) : (
            Object.entries(groups).map(([date, entries]) => (
              <div key={date} className="mb-3">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                  {date}
                </div>
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleClick(entry)}
                    className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-[var(--color-bg-alt)] transition-colors duration-100"
                  >
                    <div className="text-xs font-medium text-[var(--color-text)]">{entry.calculatorName}</div>
                    <div className="text-[10px] text-[var(--color-text-subtle)] mt-0.5 truncate">
                      {Object.entries(entry.inputs)
                        .slice(0, 4)
                        .map(([k, v]) => `${k}=${typeof v === 'number' ? (v as number).toFixed(2) : v}`)
                        .join(', ')}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-subtle)]">
                      {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
