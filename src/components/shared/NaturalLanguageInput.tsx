import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { parseNaturalLanguage } from '../../utils/nlp-parser';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface NaturalLanguageInputProps {
  onFill?: (values: Record<string, number>) => void;
  onShapeChange?: (shape: string) => void;
}

export function NaturalLanguageInput({ onFill, onShapeChange }: NaturalLanguageInputProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseNaturalLanguage>>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!text.trim()) return;
    const result = parseNaturalLanguage(text);
    setParsed(result);

    if (!result || Object.keys(result.values).length === 0) {
      toast.error('Could not parse input — try specifying values like Q=10, b=5');
      return;
    }

    if (result.calculatorId) {
      navigate(`/${result.calculatorId}`);
    }

    if (result.shape && onShapeChange) {
      onShapeChange(result.shape);
    }

    if (Object.keys(result.values).length > 0 && onFill) {
      onFill(result.values);
    }

    const count = Object.keys(result.values).length;
    toast.success(`Parsed ${count} parameter${count > 1 ? 's' : ''} from text`);
  };

  return (
    <div className="no-print">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] transition-colors mb-2"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <MessageSquare className="w-3 h-3" />
        Describe your problem in words
      </button>

      {open && (
        <div className="space-y-2 animate-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder='e.g. "rectangular channel 3m wide, Q=5 m3/s, slope 0.001"'
              className="flex-1 px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
            />
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1 px-3 py-2 bg-[var(--color-accent)] text-white rounded-[6px] text-sm hover:opacity-90"
            >
              <Sparkles className="w-3.5 h-3.5" /> Parse
            </button>
          </div>

          {parsed && Object.keys(parsed.values).length > 0 && (
            <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] px-3 py-2 rounded-[6px]">
              Detected: {Object.entries(parsed.values).map(([k, v]) => `${k}=${v}`).join(', ')}
              {parsed.shape && ` | Shape: ${parsed.shape}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
