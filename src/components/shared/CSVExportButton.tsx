import { FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '../../utils/csv-export';
import { useToast } from '../../context/ToastContext';

interface CSVExportButtonProps {
  headers: string[];
  data: (string | number)[][];
  filename?: string;
}

export function CSVExportButton({ headers, data, filename = 'hydro-calc' }: CSVExportButtonProps) {
  const toast = useToast();

  const handleExport = () => {
    try {
      exportToCSV(headers, data, filename);
      toast.success('CSV exported');
    } catch {
      toast.error('CSV export failed');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-[6px] bg-transparent hover:bg-[var(--color-bg-alt)] transition-[background-color,border-color] duration-200 text-[var(--color-text-muted)] hover:text-[var(--color-text)] no-print"
    >
      <FileSpreadsheet className="w-4 h-4" /> Export CSV
    </button>
  );
}
