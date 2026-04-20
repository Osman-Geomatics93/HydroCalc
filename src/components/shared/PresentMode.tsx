import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface PresentModeProps {
  children: ReactNode;
}

export function PresentMode({ children }: PresentModeProps) {
  const navigate = useNavigate();

  const exitPresent = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('present');
    navigate(url.pathname + url.search, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8 lg:p-16" style={{ fontSize: '1.15em' }}>
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
      <button
        onClick={exitPresent}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full shadow-[var(--shadow-lg)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] z-50"
      >
        <X className="w-4 h-4" /> Exit Present Mode
      </button>
    </div>
  );
}
