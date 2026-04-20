import { formatForClipboard, FORMAT_LABELS, type ClipboardFormat } from '../../lib/utils/format-clipboard';
import { useToast } from '../../context/ToastContext';

interface CopyFormatMenuProps {
  value: number | string;
  unit?: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const FORMATS: ClipboardFormat[] = ['plain', 'engineering', 'latex', 'excel'];

export function CopyFormatMenu({ value, unit, position, onClose }: CopyFormatMenuProps) {
  const toast = useToast();

  const handleCopy = async (format: ClipboardFormat) => {
    const text = formatForClipboard(value, unit, format);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied (${FORMAT_LABELS[format]})`);
    } catch {
      toast.error('Copy failed');
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] shadow-[var(--shadow-md)] py-1 min-w-[160px]"
        style={{ left: position.x, top: position.y }}
      >
        <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Copy as…
        </div>
        {FORMATS.map((fmt) => (
          <button
            key={fmt}
            onClick={() => handleCopy(fmt)}
            className="w-full text-left px-3 py-1.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] transition-colors"
          >
            {FORMAT_LABELS[fmt]}
          </button>
        ))}
      </div>
    </>
  );
}
