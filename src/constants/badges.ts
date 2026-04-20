export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: 'first-flow', name: 'First Flow', icon: 'Droplets', description: 'Use any calculator once' },
  { id: 'channel-master', name: 'Channel Master', icon: 'Ruler', description: 'Use all Ch1 calculators' },
  { id: 'energy-expert', name: 'Energy Expert', icon: 'Zap', description: 'Use all Ch2 calculators' },
  { id: 'momentum-maven', name: 'Momentum Maven', icon: 'ArrowRightLeft', description: 'Use all Ch3 calculators' },
  { id: 'flow-guru', name: 'Flow Guru', icon: 'Waves', description: 'Use all Ch4 calculators' },
  { id: 'full-course', name: 'Full Course', icon: 'GraduationCap', description: 'Use all 18 calculators' },
  { id: 'speed-demon', name: 'Speed Demon', icon: 'Timer', description: 'Solve 10 practice problems' },
  { id: 'night-owl', name: 'Night Owl', icon: 'Moon', description: 'Use dark mode' },
  { id: 'globetrotter', name: 'Globetrotter', icon: 'Globe', description: 'Switch language' },
  { id: 'streak-7', name: 'Streak 7', icon: 'Flame', description: 'Use app 7 days in a row' },
  { id: 'calculator-10', name: 'Power User', icon: 'Calculator', description: 'Perform 50 calculations' },
  { id: 'sediment-scholar', name: 'Sediment Scholar', icon: 'Mountain', description: 'Use all Ch7 calculators' },
];

export const CHAPTER_CALCULATORS: Record<string, string[]> = {
  ch1: ['/ch1/geometry', '/ch1/froude'],
  ch2: ['/ch2/energy', '/ch2/critical-depth', '/ch2/alternate-depths', '/ch2/obstructions'],
  ch3: ['/ch3/momentum', '/ch3/hydraulic-jump', '/ch3/combined'],
  ch4: ['/ch4/manning', '/ch4/normal-depth', '/ch4/classification'],
  ch5: ['/ch5/taxonomy', '/ch5/composite'],
  ch6: ['/ch6/standard-step', '/ch6/profiles', '/ch6/multi-reach'],
  ch7: ['/ch7/fall-velocity', '/ch7/shields', '/ch7/bed-load'],
};

export const ALL_CALCULATORS = Object.values(CHAPTER_CALCULATORS).flat();
