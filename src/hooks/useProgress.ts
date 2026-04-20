import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ALL_CALCULATORS, CHAPTER_CALCULATORS, BADGES } from '../constants/badges';

interface ProgressData {
  calculatorsUsed: string[];
  totalCalcs: number;
  badges: string[];
  streak: number;
  lastVisit: string;
  practicesSolved: number;
  darkModeUsed: boolean;
  langSwitched: boolean;
}

const DEFAULT_PROGRESS: ProgressData = {
  calculatorsUsed: [],
  totalCalcs: 0,
  badges: [],
  streak: 0,
  lastVisit: '',
  practicesSolved: 0,
  darkModeUsed: false,
  langSwitched: false,
};

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<ProgressData>('hydro-progress', DEFAULT_PROGRESS);

  const addCalculation = useCallback((path: string) => {
    setProgress((prev) => {
      const used = prev.calculatorsUsed.includes(path)
        ? prev.calculatorsUsed
        : [...prev.calculatorsUsed, path];
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let streak = prev.streak;
      if (prev.lastVisit === yesterday) streak += 1;
      else if (prev.lastVisit !== today) streak = 1;
      return { ...prev, calculatorsUsed: used, totalCalcs: prev.totalCalcs + 1, streak, lastVisit: today };
    });
  }, [setProgress]);

  const addPracticeSolved = useCallback(() => {
    setProgress((prev) => ({ ...prev, practicesSolved: prev.practicesSolved + 1 }));
  }, [setProgress]);

  const setDarkModeUsed = useCallback(() => {
    setProgress((prev) => ({ ...prev, darkModeUsed: true }));
  }, [setProgress]);

  const setLangSwitched = useCallback(() => {
    setProgress((prev) => ({ ...prev, langSwitched: true }));
  }, [setProgress]);

  const checkBadges = useCallback(() => {
    setProgress((prev) => {
      const earned: string[] = [...prev.badges];
      const check = (id: string, cond: boolean) => {
        if (cond && !earned.includes(id)) earned.push(id);
      };

      check('first-flow', prev.calculatorsUsed.length >= 1);
      check('channel-master', CHAPTER_CALCULATORS.ch1.every((c) => prev.calculatorsUsed.includes(c)));
      check('energy-expert', CHAPTER_CALCULATORS.ch2.every((c) => prev.calculatorsUsed.includes(c)));
      check('momentum-maven', CHAPTER_CALCULATORS.ch3.every((c) => prev.calculatorsUsed.includes(c)));
      check('flow-guru', CHAPTER_CALCULATORS.ch4.every((c) => prev.calculatorsUsed.includes(c)));
      check('sediment-scholar', CHAPTER_CALCULATORS.ch7.every((c) => prev.calculatorsUsed.includes(c)));
      check('full-course', ALL_CALCULATORS.every((c) => prev.calculatorsUsed.includes(c)));
      check('speed-demon', prev.practicesSolved >= 10);
      check('night-owl', prev.darkModeUsed);
      check('globetrotter', prev.langSwitched);
      check('streak-7', prev.streak >= 7);
      check('calculator-10', prev.totalCalcs >= 50);

      if (earned.length !== prev.badges.length) {
        return { ...prev, badges: earned };
      }
      return prev;
    });
  }, [setProgress]);

  const percentComplete = useMemo(
    () => Math.round((progress.calculatorsUsed.length / ALL_CALCULATORS.length) * 100),
    [progress.calculatorsUsed.length]
  );

  const badges = useMemo(
    () => BADGES.map((b) => ({ ...b, unlocked: progress.badges.includes(b.id) })),
    [progress.badges]
  );

  return {
    progress,
    badges,
    percentComplete,
    addCalculation,
    addPracticeSolved,
    setDarkModeUsed,
    setLangSwitched,
    checkBadges,
  };
}
