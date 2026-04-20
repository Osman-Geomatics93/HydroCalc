import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Tutorial } from '../../constants/tutorials';

interface TutorialOverlayProps {
  tutorial: Tutorial | null;
  onClose: () => void;
}

export function TutorialOverlay({ tutorial, onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [, setSeenTutorials] = useLocalStorage<Record<string, boolean>>('hydro-tutorials-seen', {});
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorial?.steps[step];

  const updateRect = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  useEffect(() => {
    setStep(0);
  }, [tutorial]);

  const handleNext = () => {
    if (!tutorial) return;
    if (step < tutorial.steps.length - 1) {
      setStep(step + 1);
    } else {
      setSeenTutorials((prev) => ({ ...prev, [tutorial.id]: true }));
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    if (tutorial) {
      setSeenTutorials((prev) => ({ ...prev, [tutorial.id]: true }));
    }
    onClose();
  };

  if (!tutorial || !currentStep) return null;

  const pad = 8;
  const spotlightStyle = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : { top: '50%', left: '50%', width: 0, height: 0 };

  // Position card relative to spotlight
  const cardStyle: React.CSSProperties = {};
  if (rect) {
    if (currentStep.position === 'bottom') {
      cardStyle.top = rect.bottom + pad + 12;
      cardStyle.left = Math.max(16, rect.left);
    } else if (currentStep.position === 'top') {
      cardStyle.bottom = window.innerHeight - rect.top + pad + 12;
      cardStyle.left = Math.max(16, rect.left);
    } else if (currentStep.position === 'right') {
      cardStyle.top = rect.top;
      cardStyle.left = rect.right + pad + 12;
    } else {
      cardStyle.top = rect.top;
      cardStyle.right = window.innerWidth - rect.left + pad + 12;
    }
  }

  const isLast = step === tutorial.steps.length - 1;

  return (
    <div className="fixed inset-0 z-[9997]" onClick={handleSkip}>
      <div className="tutorial-spotlight" style={spotlightStyle} />
      <div
        ref={cardRef}
        className="tutorial-card"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">{currentStep.title}</h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{currentStep.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-[var(--color-text-subtle)]">
            {step + 1} of {tutorial.steps.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={handleSkip}
              className="px-2 py-1 text-[11px] text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]"
            >
              Skip
            </button>
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-2 py-1 text-[11px] border border-[var(--color-border)] rounded-[4px] hover:bg-[var(--color-bg-alt)]"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1 text-[11px] bg-[var(--color-accent)] text-white rounded-[4px] hover:opacity-90"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1 justify-center mt-2">
          {tutorial.steps.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
