import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { PROBLEM_BANK, type Problem } from '../constants/problems';

interface PracticeScores {
  [calculatorId: string]: { correct: number; total: number; bestPct: number };
}

export function usePracticeMode(calculatorId: string) {
  const problems = PROBLEM_BANK[calculatorId] || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [hintIdx, setHintIdx] = useState(-1);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'> | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [scores, setScores] = useLocalStorage<PracticeScores>('hydro-practice-scores', {});
  const timerRef = useRef<number | null>(null);

  const currentProblem: Problem | null = problems[currentIdx] || null;

  useEffect(() => {
    if (isExamMode) {
      timerRef.current = window.setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamMode]);

  const checkAnswer = useCallback((answers: Record<string, number>) => {
    if (!currentProblem) return false;
    const fb: Record<string, 'correct' | 'incorrect'> = {};
    let allCorrect = true;

    for (const [key, expected] of Object.entries(currentProblem.expectedOutputs)) {
      const userVal = answers[key];
      if (userVal === undefined || Math.abs(userVal - expected.value) > expected.tolerance) {
        fb[key] = 'incorrect';
        allCorrect = false;
      } else {
        fb[key] = 'correct';
      }
    }

    setFeedback(fb);
    setScore((s) => ({
      correct: s.correct + (allCorrect ? 1 : 0),
      total: s.total + 1,
    }));

    return allCorrect;
  }, [currentProblem]);

  const nextProblem = useCallback(() => {
    const next = currentIdx + 1;
    if (next < problems.length) {
      setCurrentIdx(next);
      setFeedback(null);
      setHintIdx(-1);
    }
  }, [currentIdx, problems.length]);

  const showHint = useCallback(() => {
    if (!currentProblem) return;
    setHintIdx((i) => Math.min(i + 1, currentProblem.hints.length - 1));
  }, [currentProblem]);

  const reset = useCallback(() => {
    setCurrentIdx(0);
    setScore({ correct: 0, total: 0 });
    setHintIdx(-1);
    setFeedback(null);
    setTimer(0);
  }, []);

  const saveScore = useCallback(() => {
    if (score.total === 0) return;
    const pct = Math.round((score.correct / score.total) * 100);
    setScores((prev) => ({
      ...prev,
      [calculatorId]: {
        correct: score.correct,
        total: score.total,
        bestPct: Math.max(pct, prev[calculatorId]?.bestPct || 0),
      },
    }));
  }, [calculatorId, score, setScores]);

  const toggleExamMode = useCallback(() => {
    setIsExamMode((e) => !e);
    reset();
  }, [reset]);

  return {
    currentProblem,
    currentIdx,
    totalProblems: problems.length,
    checkAnswer,
    nextProblem,
    score,
    hint: currentProblem && hintIdx >= 0 ? currentProblem.hints.slice(0, hintIdx + 1) : [],
    showHint,
    isExamMode,
    toggleExamMode,
    timer,
    feedback,
    reset,
    saveScore,
    hasPractice: problems.length > 0,
    bestScore: scores[calculatorId]?.bestPct || 0,
  };
}
