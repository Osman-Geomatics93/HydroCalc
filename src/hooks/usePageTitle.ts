import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/ch1/geometry': 'Channel Geometry',
  '/ch1/froude': 'Froude Number',
  '/ch2/energy': 'Specific Energy (E-y)',
  '/ch2/critical-depth': 'Critical Depth',
  '/ch2/alternate-depths': 'Alternate Depths',
  '/ch2/obstructions': 'Channel Obstructions',
  '/ch3/momentum': 'Momentum Function (M-y)',
  '/ch3/hydraulic-jump': 'Hydraulic Jump',
  '/ch3/combined': 'Combined Energy & Momentum',
  '/ch4/manning': "Manning's Equation",
  '/ch4/normal-depth': 'Normal Depth',
  '/ch4/classification': 'Reach Classification',
  '/ch5/taxonomy': 'Profile Taxonomy',
  '/ch5/composite': 'Composite Profiles',
  '/ch6/standard-step': 'Standard Step Method',
  '/ch6/profiles': 'Water Surface Profiles',
  '/ch6/multi-reach': 'Multi-Reach Profile',
  '/ch7/fall-velocity': 'Fall Velocity',
  '/ch7/shields': 'Shields Diagram',
  '/ch7/bed-load': 'Bed Load Transport',
  '/design-wizard': 'Design Wizard',
  '/cheat-sheet': 'Formula Cheat Sheet',
  '/workflow': 'Workflow Builder',
  '/reference': 'Reference Formulas',
  '/case-studies': 'Case Studies',
  '/batch': 'Batch Calculator',
};

export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageTitle = ROUTE_TITLES[pathname];
    // For case study detail pages
    const isCaseStudy = pathname.startsWith('/case-studies/') && pathname !== '/case-studies';

    if (pageTitle) {
      document.title = `${pageTitle} | HydroCalc`;
    } else if (isCaseStudy) {
      document.title = 'Case Study | HydroCalc';
    } else {
      document.title = 'HydroCalc — Open Channel Flow';
    }
  }, [pathname]);
}
