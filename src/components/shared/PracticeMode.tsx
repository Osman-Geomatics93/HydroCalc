import { useState, useEffect } from 'react';
import { X, Lightbulb, CheckCircle2, XCircle, ChevronRight, Timer, RotateCcw } from 'lucide-react';
import { FormulaDisplay } from './FormulaDisplay';
import { usePracticeMode } from '../../hooks/usePracticeMode';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface PracticeModeProps {
  calculatorId: string;
  onClose: () => void;
}

export function PracticeMode({ calculatorId, onClose }: PracticeModeProps) {
  const {
    currentProblem, currentIdx, totalProblems, checkAnswer, nextProblem,
    score, hint, showHint, isExamMode, toggleExamMode, timer, feedback,
    reset, saveScore, hasPractice, bestScore,
  } = usePracticeMode(calculatorId);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const trapRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!hasPractice) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-[var(--color-surface)] rounded-xl p-8 max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <p className="text-[var(--color-text)]">No practice problems available for this calculator yet.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded-[6px] text-sm">Close</button>
        </div>
      </div>
    );
  }

  const handleCheck = () => {
    const numAnswers: Record<string, number> = {};
    for (const [k, v] of Object.entries(answers)) {
      numAnswers[k] = parseFloat(v) || 0;
    }
    checkAnswer(numAnswers);
  };

  const handleNext = () => {
    setAnswers({});
    if (currentIdx + 1 >= totalProblems) {
      saveScore();
    } else {
      nextProblem();
    }
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isFinished = currentIdx + 1 >= totalProblems && feedback !== null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Practice Mode"
        className="bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Practice Mode</h2>
            <span className="text-sm text-[var(--color-text-muted)]">{currentIdx + 1}/{totalProblems}</span>
            {isExamMode && (
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <Timer className="w-3.5 h-3.5" /> {formatTimer(timer)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleExamMode}
              className={`text-xs px-2 py-1 rounded-[6px] border ${isExamMode
                ? 'border-amber-500 text-amber-600 bg-amber-50'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
            >
              {isExamMode ? 'Exam ON' : 'Exam Mode'}
            </button>
            <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Score bar */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--color-accent)] font-semibold">
              Score: {score.correct}/{score.total}
            </span>
            {bestScore > 0 && (
              <span className="text-[var(--color-text-muted)]">Best: {bestScore}%</span>
            )}
            {currentProblem && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                currentProblem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentProblem.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentProblem.difficulty}
              </span>
            )}
          </div>

          {/* Problem statement */}
          {currentProblem && (
            <>
              <div className="bg-[var(--color-bg)] p-4 rounded-[6px] border border-[var(--color-border)]">
                <p className="text-[var(--color-text)] text-sm leading-relaxed">{currentProblem.question}</p>
              </div>

              {/* Answer fields */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(currentProblem.expectedOutputs).map(([key, expected]) => (
                  <div key={key}>
                    <label className="text-[13px] font-medium text-[var(--color-text-muted)]">{expected.label}</label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        step="any"
                        value={answers[key] || ''}
                        onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                        disabled={feedback !== null}
                        className={`w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] outline-none ${
                          feedback?.[key] === 'correct' ? 'border-green-500 bg-green-50' :
                          feedback?.[key] === 'incorrect' ? 'border-red-500 bg-red-50' :
                          'border-[var(--color-border)]'
                        }`}
                        placeholder="Your answer..."
                      />
                      {feedback?.[key] === 'correct' && <CheckCircle2 className="absolute right-2 top-2.5 w-4 h-4 text-green-600" />}
                      {feedback?.[key] === 'incorrect' && (
                        <div className="flex items-center gap-1 mt-1">
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs text-red-600">
                            Expected: {expected.value.toPrecision(4)} (±{expected.tolerance})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hints */}
              {!isExamMode && hint.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-[6px] p-3 text-sm text-amber-800 space-y-1">
                  {hint.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <FormulaDisplay latex={h} block={false} />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!feedback ? (
                  <>
                    <button
                      onClick={handleCheck}
                      className="px-5 py-2 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90"
                    >
                      Check Answer
                    </button>
                    {!isExamMode && (
                      <button onClick={showHint} className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-amber-600">
                        <Lightbulb className="w-4 h-4" /> Hint
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {!isFinished ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-1 px-5 py-2 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90"
                      >
                        Next Problem <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[var(--color-accent)]">
                          Final Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
                        </span>
                        <button onClick={() => { reset(); setAnswers({}); }} className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                          <RotateCcw className="w-4 h-4" /> Try Again
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
