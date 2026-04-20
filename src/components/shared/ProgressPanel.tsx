import { useEffect } from 'react';
import { X, Trophy, Flame, Lock, Unlock } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';

interface ProgressPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ProgressPanel({ open, onClose }: ProgressPanelProps) {
  const { progress, badges, percentComplete, checkBadges } = useProgress();

  useEffect(() => {
    if (open) checkBadges();
  }, [open, checkBadges]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <aside
        className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-[var(--shadow-lg)] history-panel-enter overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-[var(--color-text)]">Progress</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--color-text-muted)]">Calculators Explored</span>
              <span className="font-semibold text-[var(--color-accent)]">{progress.calculatorsUsed.length}/18</span>
            </div>
            <div className="w-full h-2 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <div className="text-xs text-[var(--color-text-subtle)] mt-1">{percentComplete}% complete</div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 bg-[var(--color-bg-alt)] rounded-[6px] p-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <div className="font-semibold text-[var(--color-text)]">{progress.streak} day streak</div>
              <div className="text-xs text-[var(--color-text-muted)]">{progress.totalCalcs} total calculations</div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-subtle)] mb-3">
              Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-1 p-3 rounded-[6px] border text-center ${
                    badge.unlocked
                      ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700'
                      : 'border-[var(--color-border)] opacity-40'
                  }`}
                  title={badge.description}
                >
                  {badge.unlocked ? (
                    <Unlock className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-[var(--color-text-subtle)]" />
                  )}
                  <span className="text-[10px] font-medium text-[var(--color-text)] leading-tight">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
