export interface TutorialStep {
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface Tutorial {
  id: string;
  name: string;
  steps: TutorialStep[];
}

export const TUTORIALS: Record<string, Tutorial> = {
  'getting-started': {
    id: 'getting-started',
    name: 'Getting Started',
    steps: [
      {
        targetSelector: 'aside nav',
        title: 'Navigation Sidebar',
        description: 'Browse calculators organized by textbook chapter. Click any item to open that calculator.',
        position: 'right',
      },
      {
        targetSelector: '[data-tutorial="inputs"]',
        title: 'Input Parameters',
        description: 'Enter your values here. Results update instantly as you type. All inputs are saved in the URL for sharing.',
        position: 'bottom',
      },
      {
        targetSelector: '[data-tutorial="results"]',
        title: 'Results',
        description: 'Computed results appear here. Click any result card to copy its value to the clipboard.',
        position: 'top',
      },
      {
        targetSelector: '[data-tutorial="presets"]',
        title: 'Presets',
        description: 'Load example values to quickly explore typical scenarios. Great for learning!',
        position: 'bottom',
      },
    ],
  },
  'ch2-energy': {
    id: 'ch2-energy',
    name: 'Understanding Specific Energy',
    steps: [
      {
        targetSelector: '.katex-display',
        title: 'The Energy Equation',
        description: 'Specific energy E = y + V^2/(2g). It represents the total energy per unit weight measured from the channel bottom.',
        position: 'bottom',
      },
      {
        targetSelector: '[data-tutorial="inputs"]',
        title: 'Set Your Parameters',
        description: 'Try changing the discharge Q and depth y to see how energy changes. Notice what happens near critical depth.',
        position: 'bottom',
      },
      {
        targetSelector: '.js-plotly-plot',
        title: 'E-y Diagram',
        description: 'This curve shows energy vs depth. The minimum point is critical depth. The dashed line is E = y (zero velocity).',
        position: 'top',
      },
    ],
  },
  'using-presets': {
    id: 'using-presets',
    name: 'Using Presets',
    steps: [
      {
        targetSelector: '[data-tutorial="presets"]',
        title: 'Select a Preset',
        description: 'Click the dropdown to see available example scenarios. Each preset loads realistic engineering values.',
        position: 'bottom',
      },
      {
        targetSelector: '[data-tutorial="inputs"]',
        title: 'Values Update',
        description: 'All input fields are populated with the preset values. You can then modify them as needed.',
        position: 'bottom',
      },
    ],
  },
  'exporting-results': {
    id: 'exporting-results',
    name: 'Exporting Results',
    steps: [
      {
        targetSelector: '[data-tutorial="results"]',
        title: 'Copy Individual Results',
        description: 'Click any result card to copy its value. A toast notification confirms the copy.',
        position: 'top',
      },
      {
        targetSelector: '[data-tutorial="export-buttons"]',
        title: 'Export Options',
        description: 'Use Export PDF for print-ready documents, Export CSV for spreadsheet data, or Copy Link to share your calculation.',
        position: 'top',
      },
    ],
  },
  'keyboard-shortcuts': {
    id: 'keyboard-shortcuts',
    name: 'Keyboard Shortcuts',
    steps: [
      {
        targetSelector: 'header',
        title: 'Quick Navigation',
        description: 'Press Ctrl+K to open the command palette. Search for any calculator by name.',
        position: 'bottom',
      },
      {
        targetSelector: 'header',
        title: 'Unit & Theme Toggles',
        description: 'Ctrl+U toggles SI/US units. Ctrl+J toggles dark/light mode. Ctrl+Z/Ctrl+Shift+Z for undo/redo.',
        position: 'bottom',
      },
    ],
  },
};

export const TUTORIAL_LIST = Object.values(TUTORIALS);
