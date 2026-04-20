import { Link2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function CopyLinkButton() {
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-[6px] bg-transparent hover:bg-[var(--color-bg-alt)] transition-[background-color,border-color] duration-200 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
    >
      <Link2 className="w-4 h-4" /> Copy Link
    </button>
  );
}
