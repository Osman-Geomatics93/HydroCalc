import { X } from 'lucide-react';
import type { Toast as ToastType } from '../../context/ToastContext';

const borderColors: Record<string, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};

export function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  return (
    <div
      className={`toast-enter flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] border-l-4 ${borderColors[toast.type]} rounded-[6px] px-4 py-3 shadow-[var(--shadow-md)] min-w-[250px] max-w-[380px]`}
      role="alert"
    >
      <span className="text-sm text-[var(--color-text)] flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
