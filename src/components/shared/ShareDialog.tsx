import { useState, useMemo } from 'react';
import { X, Copy, Check, Share2, Presentation } from 'lucide-react';
import { generateQRCode } from '../../lib/utils/qr-code';
import { useToast } from '../../context/ToastContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ShareDialogProps {
  onClose: () => void;
}

export function ShareDialog({ onClose }: ShareDialogProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>();

  const currentUrl = window.location.href;
  const presentUrl = currentUrl + (currentUrl.includes('?') ? '&' : '?') + 'present=true';

  const qrSvg = useMemo(() => generateQRCode(currentUrl), [currentUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('URL copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'HydroCalc', url: currentUrl });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Share"
        className="bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-bold text-[var(--color-text)]">Share</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div
              className="w-48 h-48 bg-white rounded-lg p-2"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>

          {/* URL input */}
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 border border-[var(--color-border)] rounded-[6px] hover:border-[var(--color-accent)] text-[var(--color-text-muted)]"
              aria-label="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {typeof navigator.share === 'function' && (
              <button
                onClick={handleWebShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            )}
            <a
              href={presentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-[6px] text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]"
            >
              <Presentation className="w-4 h-4" /> Present Mode
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
