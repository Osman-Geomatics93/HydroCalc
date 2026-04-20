import { useState, useEffect } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { generateReport, type ReportConfig } from '../../utils/pdf-report';
import { useToast } from '../../context/ToastContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ReportDialogProps {
  onClose: () => void;
  calculatorTitle: string;
  inputs: { label: string; value: string; unit: string }[];
  results: { label: string; value: string; unit: string }[];
  chartElementId?: string;
}

export function ReportDialog({ onClose, calculatorTitle, inputs, results, chartElementId }: ReportDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const toast = useToast();
  const trapRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const config: ReportConfig = {
        projectName: projectName || 'HydroCalc Analysis',
        engineerName,
        notes,
        calculatorTitle,
        inputs,
        results,
        chartElementId,
      };
      await generateReport(config);
      toast.success('Report downloaded');
      onClose();
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Generate PDF Report"
        className="bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-bold text-[var(--color-text)]">Generate PDF Report</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Channel Design"
              className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Engineer Name</label>
            <input
              type="text"
              value={engineerName}
              onChange={(e) => setEngineerName(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the report..."
              rows={3}
              className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>

          <div className="bg-[var(--color-bg-alt)] rounded-[6px] p-3 text-xs text-[var(--color-text-muted)]">
            Report includes: cover page, {inputs.length} input parameters, {results.length} results{chartElementId ? ', chart screenshot' : ''}.
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Generating...' : 'Download PDF Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
