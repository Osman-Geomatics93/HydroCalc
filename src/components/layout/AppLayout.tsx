import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../shared/ToastContainer';
import { CommandPalette } from '../shared/CommandPalette';
import { HistoryPanel } from '../shared/HistoryPanel';
import { TutorialOverlay } from '../shared/TutorialOverlay';
import { ProgressPanel } from '../shared/ProgressPanel';
import { QuickConverter } from '../shared/QuickConverter';
import { PracticeMode } from '../shared/PracticeMode';
import { SkipToContent } from '../shared/SkipToContent';
import { OfflineIndicator } from '../shared/OfflineIndicator';
import { InstallPrompt } from '../shared/InstallPrompt';
import { PresentMode } from '../shared/PresentMode';
import { useHotkeys } from '../../hooks/useHotkeys';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useUnits } from '../../context/UnitContext';
import { useTheme } from '../../context/ThemeContext';
import { useSliderMode } from '../../context/SliderModeContext';
import { useProgress } from '../../hooks/useProgress';
import { TUTORIALS, type Tutorial } from '../../constants/tutorials';

// Map routes to calculator IDs for practice mode
const ROUTE_TO_CALC_ID: Record<string, string> = {
  '/ch1/geometry': 'ch1-geometry',
  '/ch1/froude': 'ch1-froude',
  '/ch2/energy': 'ch2-energy',
  '/ch2/alternate-depths': 'ch2-alternate',
  '/ch3/momentum': 'ch3-momentum',
  '/ch3/hydraulic-jump': 'ch3-hydraulic-jump',
  '/ch4/manning': 'ch4-manning',
  '/ch4/normal-depth': 'ch4-normal-depth',
  '/ch7/shields': 'ch7-shields',
};

export function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [comparisonActive, setComparisonActive] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const { toggleUnits } = useUnits();
  const { toggleTheme } = useTheme();
  const { toggleSliderMode } = useSliderMode();
  const { addCalculation, checkBadges } = useProgress();
  const location = useLocation();
  usePageTitle();

  // Track calculator usage
  useEffect(() => {
    if (location.pathname !== '/') {
      addCalculation(location.pathname);
      checkBadges();
    }
  }, [location.pathname, addCalculation, checkBadges]);

  const currentCalcId = ROUTE_TO_CALC_ID[location.pathname] || '';

  const shortcuts = useCallback(() => ({
    'mod+k': () => setPaletteOpen(true),
    'mod+u': toggleUnits,
    'mod+j': toggleTheme,
    'mod+shift+s': toggleSliderMode,
    'mod+z': () => window.history.back(),
    'mod+shift+z': () => window.history.forward(),
    'mod+shift+p': () => { if (currentCalcId) setPracticeOpen(true); },
  }), [toggleUnits, toggleTheme, toggleSliderMode, currentCalcId]);

  useHotkeys(shortcuts());

  const handleTutorialOpen = () => {
    setActiveTutorial(TUTORIALS['getting-started'] || null);
  };

  const [searchParams] = useSearchParams();
  const isPresent = searchParams.get('present') === 'true';

  if (isPresent) {
    return (
      <PresentMode>
        <Outlet context={{ comparisonActive }} />
      </PresentMode>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <SkipToContent />
      <Header
        onHistoryOpen={() => setHistoryOpen(true)}
        onComparisonToggle={() => setComparisonActive(!comparisonActive)}
        onTutorialOpen={handleTutorialOpen}
        onPracticeOpen={currentCalcId ? () => setPracticeOpen(true) : undefined}
        onProgressOpen={() => setProgressOpen(true)}
        comparisonActive={comparisonActive}
      />
      <OfflineIndicator />
      <InstallPrompt />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main id="main-content" className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[var(--color-bg)]">
          <Outlet context={{ comparisonActive }} />
        </main>
      </div>
      <ToastContainer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <TutorialOverlay tutorial={activeTutorial} onClose={() => setActiveTutorial(null)} />
      <ProgressPanel open={progressOpen} onClose={() => setProgressOpen(false)} />
      <QuickConverter />
      {practiceOpen && currentCalcId && (
        <PracticeMode calculatorId={currentCalcId} onClose={() => setPracticeOpen(false)} />
      )}
    </div>
  );
}
