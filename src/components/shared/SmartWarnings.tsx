import { Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Warning } from '../../utils/flow-warnings';

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertOctagon,
};

const STYLES = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
  danger: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300',
};

interface SmartWarningsProps {
  warnings: Warning[];
}

export function SmartWarnings({ warnings }: SmartWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => {
        const Icon = ICONS[w.type];
        return (
          <div key={i} className={`flex items-start gap-2 px-4 py-2.5 rounded-[6px] border text-sm ${STYLES[w.type]}`}>
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1">{w.message}</span>
            {w.learnMore && (
              <Link to={w.learnMore} className="underline text-xs opacity-70 hover:opacity-100 shrink-0">
                Learn more
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
