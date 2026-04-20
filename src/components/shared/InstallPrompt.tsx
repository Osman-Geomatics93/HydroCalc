import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [dismissed, setDismissed] = useLocalStorage('hydro-install-dismissed', false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (dismissed || !deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  };

  return (
    <div className="bg-[var(--color-accent-bg)] border-b border-[var(--color-accent)]/20 px-4 py-2 flex items-center justify-between text-sm no-print">
      <div className="flex items-center gap-2 text-[var(--color-accent)]">
        <Download className="w-4 h-4" />
        <span>Install HydroCalc for offline access</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1 bg-[var(--color-accent)] text-white rounded-[6px] text-xs font-medium hover:opacity-90"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
