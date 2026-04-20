import { useMemo } from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { findValidationRule, type ValidationRule } from '../../constants/validation';
import { useSliderMode } from '../../context/SliderModeContext';
import { HelpPopover } from './HelpPopover';

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  validationRule?: ValidationRule;
  glossaryTerm?: string;
}

export function InputField({
  label, value, onChange, unit, min, max, step = 0.01, disabled,
  validationRule, glossaryTerm,
}: InputFieldProps) {
  const { sliderMode } = useSliderMode();
  const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;

  // Auto-detect validation rule from label if not provided
  const rule = useMemo(() => validationRule ?? findValidationRule(label), [validationRule, label]);

  // Validation state
  const validation = useMemo(() => {
    if (!rule) return null;
    const v = numValue;
    if (rule.min !== undefined && v < rule.min) {
      return { type: 'error' as const, message: `Must be >= ${rule.min}` };
    }
    if (rule.max !== undefined && v > rule.max) {
      return { type: 'error' as const, message: `Must be <= ${rule.max}` };
    }
    if (rule.warningMax !== undefined && v > rule.warningMax) {
      return { type: 'warning' as const, message: rule.warning || `Unusually high value (>${rule.warningMax})` };
    }
    if (rule.warningMin !== undefined && v < rule.warningMin) {
      return { type: 'warning' as const, message: rule.warning || `Unusually low value (<${rule.warningMin})` };
    }
    return null;
  }, [rule, numValue]);

  const borderClass = validation?.type === 'error'
    ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
    : validation?.type === 'warning'
    ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-400/20'
    : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]/20';

  // Slider range
  const sliderMin = min ?? (rule?.min ?? 0);
  const sliderMax = max ?? (rule?.max ?? (numValue * 3 || 10));
  const sliderStep = step;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-medium text-[var(--color-text-muted)] tracking-wide flex items-center">
        {label} {unit && <span className="text-[var(--color-text-subtle)]">&nbsp;({unit})</span>}
        {glossaryTerm && <HelpPopover glossaryKey={glossaryTerm} />}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={validation?.type === 'error' ? true : undefined}
        aria-describedby={validation ? `${label}-validation` : undefined}
        className={`px-3 py-2 border rounded-[6px] text-sm text-[var(--color-text)] ${borderClass} outline-none disabled:bg-[var(--color-bg-alt)] transition-[border-color,box-shadow] duration-200`}
      />
      {sliderMode && !disabled && (
        <input
          type="range"
          className="hydro-slider"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          value={numValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      )}
      {validation && (
        <div
          id={`${label}-validation`}
          className={`flex items-center gap-1 text-[11px] ${
            validation.type === 'error' ? 'text-red-500' : 'text-amber-500'
          }`}
        >
          {validation.type === 'error' ? (
            <AlertCircle className="w-3 h-3 shrink-0" />
          ) : (
            <AlertTriangle className="w-3 h-3 shrink-0" />
          )}
          <span>{validation.message}</span>
        </div>
      )}
      {rule?.tip && !validation && (
        <div className="text-[10px] text-[var(--color-text-subtle)]">{rule.tip}</div>
      )}
    </div>
  );
}
