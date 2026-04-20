import { Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
}

export function ExportButton({ targetId, filename = 'hydro-calc' }: ExportButtonProps) {
  const toast = useToast();

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
      toast.success('PDF exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-[6px] bg-transparent hover:bg-[var(--color-bg-alt)] transition-[background-color,border-color] duration-200 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
    >
      <Download className="w-4 h-4" /> Export PDF
    </button>
  );
}
