import { useState } from 'react';
import { X, Copy, Check, Code2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface EmbedCodeGeneratorProps {
  onClose: () => void;
  calculatorPath: string;
}

export function EmbedCodeGenerator({ onClose, calculatorPath }: EmbedCodeGeneratorProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [compact, setCompact] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>();

  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  params.set('theme', theme);
  if (compact) params.set('compact', 'true');

  const embedUrl = `${baseUrl}/embed${calculatorPath}?${params.toString()}`;
  const snippet = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" style="border-radius:8px;border:1px solid #e5e5e5;" loading="lazy"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success('Embed code copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Generate embed code"
        className="bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-bold text-[var(--color-text)]">Embed Code</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Width</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="mt-1 w-full px-2 py-1.5 border border-[var(--color-border)] rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1 w-full px-2 py-1.5 border border-[var(--color-border)] rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="mt-1 w-full px-2 py-1.5 border border-[var(--color-border)] rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)]"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} className="rounded" />
            Compact mode
          </label>

          <div className="relative">
            <pre className="bg-[var(--color-bg-alt)] p-3 rounded-[6px] text-xs text-[var(--color-text)] overflow-x-auto whitespace-pre-wrap break-all">
              {snippet}
            </pre>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Embed Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
