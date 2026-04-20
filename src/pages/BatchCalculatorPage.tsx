import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Table2, FileSpreadsheet } from 'lucide-react';
import { useUnits } from '../context/UnitContext';
import { parseCSV } from '../lib/utils/csv-import';
import { BATCH_CALCULATORS, runBatchComputation, type CalculatorSchema } from '../lib/utils/batch-compute';
import { useToast } from '../context/ToastContext';

export default function BatchCalculatorPage() {
  const { units, g } = useUnits();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [calcType, setCalcType] = useState('geometry');
  const [results, setResults] = useState<Record<string, number | string>[]>([]);
  const [dragging, setDragging] = useState(false);

  const schema = BATCH_CALCULATORS[calcType] as CalculatorSchema;
  const allColumns = [...schema.inputColumns, ...schema.outputColumns];

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      // Map rows to objects using headers
      const dataRows = rows.map((row) => {
        const obj: Record<string, number> = {};
        headers.forEach((h, i) => {
          const val = parseFloat(row[i]);
          if (!isNaN(val)) obj[h] = val;
        });
        return obj;
      });

      const computed = runBatchComputation(calcType, dataRows, units, g);
      setResults(computed);
      toast.success(`Computed ${computed.length} rows`);
    };
    reader.readAsText(file);
  }, [calcType, units, g, toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const downloadTemplate = () => {
    const headers = schema.inputColumns.join(',');
    const blob = new Blob([headers + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calcType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    if (results.length === 0) return;
    const headers = allColumns.join(',');
    const rows = results.map((r) =>
      allColumns.map((c) => {
        const val = r[c];
        return typeof val === 'number' ? val.toFixed(4) : (val ?? '');
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calcType}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Tools</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Batch Calculator
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Upload a CSV file with input parameters and compute results for all rows at once.
        </p>
      </div>

      {/* Calculator type selector */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-4">
        <label className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2 block">Calculator Type</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BATCH_CALCULATORS).map(([key, s]) => (
            <button
              key={key}
              onClick={() => { setCalcType(key); setResults([]); }}
              className={`px-3 py-1.5 text-sm rounded-[6px] border transition-colors ${
                calcType === key
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-[var(--color-text-subtle)]">
          Required columns: <code className="bg-[var(--color-bg-alt)] px-1 py-0.5 rounded">{schema.inputColumns.join(', ')}</code>
          &nbsp;→ Output: <code className="bg-[var(--color-bg-alt)] px-1 py-0.5 rounded">{schema.outputColumns.join(', ')}</code>
        </div>
      </div>

      {/* Upload area */}
      <div className="flex gap-3">
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--color-border)] rounded-[6px] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]">
          <FileSpreadsheet className="w-4 h-4" /> Download Template
        </button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-[6px] p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-subtle)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Drag & drop a CSV file here, or click to browse
        </p>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleInputChange} className="hidden" />
      </div>

      {/* Results table */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              <Table2 className="w-4 h-4" /> Results ({results.length} rows)
            </h3>
            <button onClick={exportResults} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[var(--color-accent)] text-white rounded-[6px] hover:opacity-90">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] overflow-hidden">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[var(--color-bg-alt)]">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-[var(--color-text-subtle)]">#</th>
                    {allColumns.map((col) => (
                      <th key={col} className={`px-3 py-2 text-right ${schema.outputColumns.includes(col) ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-text-subtle)]'}`}>
                        {col}
                      </th>
                    ))}
                    {results.some((r) => r.error) && (
                      <th className="px-3 py-2 text-left text-red-500">Error</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-[var(--color-bg-alt)]">
                      <td className="px-3 py-1 text-[var(--color-text-subtle)]">{i + 1}</td>
                      {allColumns.map((col) => (
                        <td key={col} className="px-3 py-1 text-right text-[var(--color-text)]">
                          {typeof row[col] === 'number' ? (row[col] as number).toFixed(4) : (row[col] ?? '')}
                        </td>
                      ))}
                      {results.some((r) => r.error) && (
                        <td className="px-3 py-1 text-red-500 text-xs">{row.error || ''}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
