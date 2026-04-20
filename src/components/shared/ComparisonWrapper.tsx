import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ComparisonWrapperProps {
  children: React.ReactNode;
  active: boolean;
}

export function ComparisonWrapper({ children, active }: ComparisonWrapperProps) {
  const [showB, setShowB] = useState(false);

  if (!active) return <>{children}</>;

  return (
    <div>
      <div className="comparison-grid">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-2 px-1">
            Scenario A
          </div>
          {children}
        </div>
        {showB ? (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-highlight)]">
                Scenario B
              </span>
              <button
                onClick={() => setShowB(false)}
                className="text-[var(--color-text-subtle)] hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {children}
          </div>
        ) : (
          <button
            onClick={() => setShowB(true)}
            className="flex items-center justify-center gap-2 border-2 border-dashed border-[var(--color-border)] rounded-[8px] min-h-[200px] text-sm text-[var(--color-text-subtle)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors duration-200"
          >
            <Plus className="w-4 h-4" /> Add Scenario
          </button>
        )}
      </div>
    </div>
  );
}
