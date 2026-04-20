import {
  Droplets, Moon, Sun, Undo2, Redo2, SlidersHorizontal,
  Clock, Columns, HelpCircle, Globe, GraduationCap, Trophy, Contrast
} from 'lucide-react';
import { useUnits } from '../../context/UnitContext';
import { useTheme } from '../../context/ThemeContext';
import { useSliderMode } from '../../context/SliderModeContext';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useI18n, LOCALE_LABELS, type Locale } from '../../context/I18nContext';
import { useState } from 'react';

interface HeaderProps {
  onHistoryOpen?: () => void;
  onComparisonToggle?: () => void;
  onTutorialOpen?: () => void;
  onPracticeOpen?: () => void;
  onProgressOpen?: () => void;
  comparisonActive?: boolean;
}

export function Header({ onHistoryOpen, onComparisonToggle, onTutorialOpen, onPracticeOpen, onProgressOpen, comparisonActive }: HeaderProps) {
  const { units, toggleUnits } = useUnits();
  const { isDark, toggleTheme, highContrast, toggleHighContrast } = useTheme();
  const { sliderMode, toggleSliderMode } = useSliderMode();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { locale, setLocale } = useI18n();
  const [langOpen, setLangOpen] = useState(false);

  const btnClass = 'border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] p-1.5 rounded-[6px] transition-[border-color,color] duration-200 text-[var(--color-text-muted)] no-print';
  const activeBtnClass = 'border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)] p-1.5 rounded-[6px] no-print';

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <Droplets className="w-7 h-7 text-[var(--color-accent)]" />
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          HydroCalc
        </h1>
        <span className="text-[var(--color-text-muted)] text-sm hidden sm:inline">Open Channel Flow</span>
      </div>
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <button onClick={undo} disabled={!canUndo} className={btnClass} title="Undo (Ctrl+Z)" aria-label="Undo" style={{ opacity: canUndo ? 1 : 0.4 }}>
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={!canRedo} className={btnClass} title="Redo (Ctrl+Shift+Z)" aria-label="Redo" style={{ opacity: canRedo ? 1 : 0.4 }}>
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />

        {/* Slider mode */}
        <button onClick={toggleSliderMode} className={sliderMode ? activeBtnClass : btnClass} title="Toggle Slider Mode (Ctrl+Shift+S)" aria-label="Toggle slider mode">
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Comparison mode */}
        {onComparisonToggle && (
          <button onClick={onComparisonToggle} className={comparisonActive ? activeBtnClass : btnClass} title="Comparison Mode" aria-label="Toggle comparison mode">
            <Columns className="w-4 h-4" />
          </button>
        )}

        {/* History */}
        {onHistoryOpen && (
          <button onClick={onHistoryOpen} className={btnClass} title="Calculation History" aria-label="Open calculation history">
            <Clock className="w-4 h-4" />
          </button>
        )}

        {/* Practice Mode */}
        {onPracticeOpen && (
          <button onClick={onPracticeOpen} className={btnClass} title="Practice Mode (Ctrl+Shift+P)" aria-label="Open practice mode">
            <GraduationCap className="w-4 h-4" />
          </button>
        )}

        {/* Progress */}
        {onProgressOpen && (
          <button onClick={onProgressOpen} className={btnClass} title="Progress & Badges" aria-label="View progress and badges">
            <Trophy className="w-4 h-4" />
          </button>
        )}

        {/* Tutorial */}
        {onTutorialOpen && (
          <button onClick={onTutorialOpen} className={btnClass} title="Help & Tutorials" aria-label="Open help and tutorials">
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />

        {/* High contrast */}
        <button onClick={toggleHighContrast} className={highContrast ? activeBtnClass : btnClass} title="Toggle High Contrast" aria-label="Toggle high contrast mode">
          <Contrast className="w-4 h-4" />
        </button>

        {/* Theme */}
        <button onClick={toggleTheme} className={btnClass} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language selector */}
        <div className="relative">
          <button onClick={() => setLangOpen(!langOpen)} className={btnClass} title="Language" aria-label="Select language">
            <Globe className="w-4 h-4" />
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] shadow-[var(--shadow-md)] py-1 min-w-[120px]">
                {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setLocale(key); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--color-bg-alt)] ${
                      locale === key ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Units */}
        <button
          onClick={toggleUnits}
          className="border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] px-4 py-1.5 rounded-[6px] text-sm font-medium transition-[border-color,color] duration-200 text-[var(--color-text-muted)] no-print"
        >
          {units === 'SI' ? 'SI (metric)' : 'US (imperial)'}
          <span className="hidden sm:inline text-xs text-[var(--color-text-subtle)] ml-1.5">Ctrl+U</span>
        </button>
      </div>
    </header>
  );
}
