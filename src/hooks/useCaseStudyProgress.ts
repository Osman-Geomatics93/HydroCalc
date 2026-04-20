import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';

interface CaseStudyProgress {
  [caseStudyId: string]: number[]; // array of completed step indices
}

export function useCaseStudyProgress() {
  const [progress, setProgress] = useLocalStorage<CaseStudyProgress>('hydro-case-study-progress', {});

  const markStepComplete = useCallback((caseStudyId: string, stepIndex: number) => {
    setProgress((prev) => {
      const existing = prev[caseStudyId] || [];
      if (existing.includes(stepIndex)) return prev;
      return { ...prev, [caseStudyId]: [...existing, stepIndex] };
    });
  }, [setProgress]);

  const getCompletedSteps = useCallback((caseStudyId: string): number[] => {
    return progress[caseStudyId] || [];
  }, [progress]);

  const getProgressPercent = useCallback((caseStudyId: string, totalSteps: number): number => {
    const completed = progress[caseStudyId] || [];
    return totalSteps > 0 ? Math.round((completed.length / totalSteps) * 100) : 0;
  }, [progress]);

  const resetProgress = useCallback((caseStudyId: string) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[caseStudyId];
      return next;
    });
  }, [setProgress]);

  return { markStepComplete, getCompletedSteps, getProgressPercent, resetProgress };
}
