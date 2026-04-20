import { Outlet, useSearchParams } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useEffect } from 'react';
import { initEmbedMessaging } from '../../lib/utils/embed-messaging';

export default function EmbedLayout() {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme') || 'light';
  const compact = searchParams.get('compact') === 'true';
  const hideInputs = searchParams.get('hideInputs') === 'true';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return initEmbedMessaging();
  }, [theme]);

  return (
    <div className={`min-h-screen bg-[var(--color-bg)] ${compact ? 'p-2' : 'p-4'}`}>
      {/* Minimal header */}
      <div className={`flex items-center gap-2 mb-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        <Droplets className={`text-[var(--color-accent)] ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        <span className="font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          HydroCalc
        </span>
        <span className="text-[var(--color-text-subtle)]">|</span>
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-subtle)] hover:text-[var(--color-accent)]">
          Powered by HydroCalc
        </a>
      </div>

      <div className={hideInputs ? '[&_.input-section]:hidden' : ''}>
        <Outlet context={{ isEmbed: true, compact }} />
      </div>
    </div>
  );
}
