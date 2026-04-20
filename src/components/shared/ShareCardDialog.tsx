import { useState, useEffect } from 'react';
import { X, Download, Copy } from 'lucide-react';
import { generateShareCard, type ShareCardData } from '../../utils/share-card';
import { useToast } from '../../context/ToastContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ShareCardDialogProps {
  onClose: () => void;
  data: ShareCardData;
}

export function ShareCardDialog({ onClose, data }: ShareCardDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const trapRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    generateShareCard(data).then((b) => {
      if (cancelled) return;
      setBlob(b);
      setImageUrl(URL.createObjectURL(b));
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [data]);

  const handleDownload = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.calculatorName.replace(/\s+/g, '-')}-card.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Image downloaded');
  };

  const handleCopy = async () => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.success('Copied to clipboard');
    } catch {
      // Fallback: download
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Share as Image"
        className="bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-[var(--color-text)]">Share as Image</h2>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
              Generating card...
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Share card" className="w-full rounded-[6px] border border-[var(--color-border)]" />
          ) : (
            <div className="text-sm text-red-600">Failed to generate card</div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!blob}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={handleCopy}
              disabled={!blob}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-[6px] text-sm font-medium hover:border-[var(--color-accent)] disabled:opacity-50"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
