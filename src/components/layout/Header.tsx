import {
  Droplets, Moon, Sun, Undo2, Redo2, SlidersHorizontal,
  Clock, Columns, HelpCircle, Globe, GraduationCap, Trophy, Contrast, MoreVertical
} from 'lucide-react';
import { useUnits } from '../../context/UnitContext';
import { useTheme } from '../../context/ThemeContext';
import { useSliderMode } from '../../context/SliderModeContext';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useI18n, LOCALE_LABELS, type Locale } from '../../context/I18nContext';
import { useState, useRef, useEffect } from 'react';

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
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  const btnClass = 'border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] p-1.5 rounded-[6px] transition-[border-color,color] duration-200 text-[var(--color-text-muted)] no-print';
  const activeBtnClass = 'border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)] p-1.5 rounded-[6px] no-print';

  const moreItemClass = 'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)] transition-colors duration-150';
  const moreActiveClass = 'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-accent)] bg-[var(--color-accent-bg)] font-medium';

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-3 sm:px-6 py-3 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <Droplets className="w-7 h-7 text-[var(--color-accent)]" />
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          HydroCalc
        </h1>
        <span className="text-[var(--color-text-muted)] text-sm hidden sm:inline">Open Channel Flow</span>
      </div>
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo — hidden on mobile, in overflow menu */}
        <button onClick={undo} disabled={!canUndo} className={`${btnClass} hidden md:inline-flex`} title="Undo (Ctrl+Z)" aria-label="Undo" style={{ opacity: canUndo ? 1 : 0.4 }}>
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={!canRedo} className={`${btnClass} hidden md:inline-flex`} title="Redo (Ctrl+Shift+Z)" aria-label="Redo" style={{ opacity: canRedo ? 1 : 0.4 }}>
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden md:block" />

        {/* Slider mode — hidden on mobile */}
        <button onClick={toggleSliderMode} className={`${sliderMode ? activeBtnClass : btnClass} hidden md:inline-flex`} title="Toggle Slider Mode (Ctrl+Shift+S)" aria-label="Toggle slider mode">
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Comparison mode — hidden on mobile */}
        {onComparisonToggle && (
          <button onClick={onComparisonToggle} className={`${comparisonActive ? activeBtnClass : btnClass} hidden md:inline-flex`} title="Comparison Mode" aria-label="Toggle comparison mode">
            <Columns className="w-4 h-4" />
          </button>
        )}

        {/* History — hidden on mobile */}
        {onHistoryOpen && (
          <button onClick={onHistoryOpen} className={`${btnClass} hidden md:inline-flex`} title="Calculation History" aria-label="Open calculation history">
            <Clock className="w-4 h-4" />
          </button>
        )}

        {/* Practice Mode — hidden on mobile */}
        {onPracticeOpen && (
          <button onClick={onPracticeOpen} className={`${btnClass} hidden md:inline-flex`} title="Practice Mode (Ctrl+Shift+P)" aria-label="Open practice mode">
            <GraduationCap className="w-4 h-4" />
          </button>
        )}

        {/* Progress — hidden on mobile */}
        {onProgressOpen && (
          <button onClick={onProgressOpen} className={`${btnClass} hidden md:inline-flex`} title="Progress & Badges" aria-label="View progress and badges">
            <Trophy className="w-4 h-4" />
          </button>
        )}

        {/* Tutorial — hidden on mobile */}
        {onTutorialOpen && (
          <button onClick={onTutorialOpen} className={`${btnClass} hidden md:inline-flex`} title="Help & Tutorials" aria-label="Open help and tutorials">
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden md:block" />

        {/* High contrast — hidden on mobile */}
        <button onClick={toggleHighContrast} className={`${highContrast ? activeBtnClass : btnClass} hidden md:inline-flex`} title="Toggle High Contrast" aria-label="Toggle high contrast mode">
          <Contrast className="w-4 h-4" />
        </button>

        {/* Theme — always visible */}
        <button onClick={toggleTheme} className={btnClass} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language selector — always visible */}
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

        {/* Units — always visible, shortened on mobile */}
        <button
          onClick={toggleUnits}
          className="border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] px-2.5 sm:px-4 py-1.5 rounded-[6px] text-sm font-medium transition-[border-color,color] duration-200 text-[var(--color-text-muted)] no-print"
        >
          <span className="sm:hidden">{units === 'SI' ? 'SI' : 'US'}</span>
          <span className="hidden sm:inline">{units === 'SI' ? 'SI (metric)' : 'US (imperial)'}</span>
          <span className="hidden sm:inline text-xs text-[var(--color-text-subtle)] ml-1.5">Ctrl+U</span>
        </button>

        {/* Mobile overflow menu — md:hidden */}
        <div className="relative md:hidden" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={btnClass}
            title="More actions"
            aria-label="More actions"
            aria-expanded={moreOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {moreOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] shadow-[var(--shadow-lg)] py-1 min-w-[200px]">
                <button onClick={() => { undo(); setMoreOpen(false); }} disabled={!canUndo} className={moreItemClass} style={{ opacity: canUndo ? 1 : 0.4 }}>
                  <Undo2 className="w-4 h-4" /> Undo
                </button>
                <button onClick={() => { redo(); setMoreOpen(false); }} disabled={!canRedo} className={moreItemClass} style={{ opacity: canRedo ? 1 : 0.4 }}>
                  <Redo2 className="w-4 h-4" /> Redo
                </button>
                <div className="h-px bg-[var(--color-border)] my-1" />
                <button onClick={() => { toggleSliderMode(); setMoreOpen(false); }} className={sliderMode ? moreActiveClass : moreItemClass}>
                  <SlidersHorizontal className="w-4 h-4" /> Slider Mode
                </button>
                {onComparisonToggle && (
                  <button onClick={() => { onComparisonToggle(); setMoreOpen(false); }} className={comparisonActive ? moreActiveClass : moreItemClass}>
                    <Columns className="w-4 h-4" /> Comparison
                  </button>
                )}
                {onHistoryOpen && (
                  <button onClick={() => { onHistoryOpen(); setMoreOpen(false); }} className={moreItemClass}>
                    <Clock className="w-4 h-4" /> History
                  </button>
                )}
                <div className="h-px bg-[var(--color-border)] my-1" />
                {onPracticeOpen && (
                  <button onClick={() => { onPracticeOpen(); setMoreOpen(false); }} className={moreItemClass}>
                    <GraduationCap className="w-4 h-4" /> Practice
                  </button>
                )}
                {onProgressOpen && (
                  <button onClick={() => { onProgressOpen(); setMoreOpen(false); }} className={moreItemClass}>
                    <Trophy className="w-4 h-4" /> Progress
                  </button>
                )}
                {onTutorialOpen && (
                  <button onClick={() => { onTutorialOpen(); setMoreOpen(false); }} className={moreItemClass}>
                    <HelpCircle className="w-4 h-4" /> Help & Tutorials
                  </button>
                )}
                <div className="h-px bg-[var(--color-border)] my-1" />
                <button onClick={() => { toggleHighContrast(); setMoreOpen(false); }} className={highContrast ? moreActiveClass : moreItemClass}>
                  <Contrast className="w-4 h-4" /> High Contrast
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
