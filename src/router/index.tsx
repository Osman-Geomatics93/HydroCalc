/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import HomePage from '../pages/HomePage';
import ReferencePage from '../pages/ReferencePage';

// Lazy-loaded calculators
const ChannelGeometryCalc = lazy(() => import('../components/calculators/ch1/ChannelGeometryCalc'));
const FroudeNumberCalc = lazy(() => import('../components/calculators/ch1/FroudeNumberCalc'));
const SpecificEnergyCalc = lazy(() => import('../components/calculators/ch2/SpecificEnergyCalc'));
const CriticalDepthCalc = lazy(() => import('../components/calculators/ch2/CriticalDepthCalc'));
const AlternateDepthsCalc = lazy(() => import('../components/calculators/ch2/AlternateDepthsCalc'));
const ObstructionsCalc = lazy(() => import('../components/calculators/ch2/ObstructionsCalc'));
const MomentumFunctionCalc = lazy(() => import('../components/calculators/ch3/MomentumFunctionCalc'));
const HydraulicJumpCalc = lazy(() => import('../components/calculators/ch3/HydraulicJumpCalc'));
const CombinedEnergyMomentumCalc = lazy(() => import('../components/calculators/ch3/CombinedEnergyMomentumCalc'));
const ManningCalc = lazy(() => import('../components/calculators/ch4/ManningCalc'));
const NormalDepthCalc = lazy(() => import('../components/calculators/ch4/NormalDepthCalc'));
const ReachClassificationCalc = lazy(() => import('../components/calculators/ch4/ReachClassificationCalc'));
const ProfileTaxonomyCalc = lazy(() => import('../components/calculators/ch5/ProfileTaxonomyCalc'));
const CompositeProfileCalc = lazy(() => import('../components/calculators/ch5/CompositeProfileCalc'));
const StandardStepCalc = lazy(() => import('../components/calculators/ch6/StandardStepCalc'));
const WaterSurfaceProfileCalc = lazy(() => import('../components/calculators/ch6/WaterSurfaceProfileCalc'));
const FallVelocityCalc = lazy(() => import('../components/calculators/ch7/FallVelocityCalc'));
const ShieldsCalc = lazy(() => import('../components/calculators/ch7/ShieldsCalc'));
const BedLoadCalc = lazy(() => import('../components/calculators/ch7/BedLoadCalc'));
const MultiReachCalc = lazy(() => import('../components/calculators/ch6/MultiReachCalc'));
const DesignWizard = lazy(() => import('../components/calculators/DesignWizard'));
const CheatSheet = lazy(() => import('../pages/CheatSheet'));
const WorkflowBuilder = lazy(() => import('../components/shared/WorkflowBuilder'));
const CaseStudiesPage = lazy(() => import('../pages/CaseStudiesPage'));
const CaseStudyDetail = lazy(() => import('../pages/CaseStudyDetail'));
const BatchCalculatorPage = lazy(() => import('../pages/BatchCalculatorPage'));
const EmbedLayout = lazy(() => import('../components/layout/EmbedLayout'));

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // Ch1
      { path: 'ch1/geometry', element: <Lazy><ChannelGeometryCalc /></Lazy> },
      { path: 'ch1/froude', element: <Lazy><FroudeNumberCalc /></Lazy> },
      // Ch2
      { path: 'ch2/energy', element: <Lazy><SpecificEnergyCalc /></Lazy> },
      { path: 'ch2/critical-depth', element: <Lazy><CriticalDepthCalc /></Lazy> },
      { path: 'ch2/alternate-depths', element: <Lazy><AlternateDepthsCalc /></Lazy> },
      { path: 'ch2/obstructions', element: <Lazy><ObstructionsCalc /></Lazy> },
      // Ch3
      { path: 'ch3/momentum', element: <Lazy><MomentumFunctionCalc /></Lazy> },
      { path: 'ch3/hydraulic-jump', element: <Lazy><HydraulicJumpCalc /></Lazy> },
      { path: 'ch3/combined', element: <Lazy><CombinedEnergyMomentumCalc /></Lazy> },
      // Ch4
      { path: 'ch4/manning', element: <Lazy><ManningCalc /></Lazy> },
      { path: 'ch4/normal-depth', element: <Lazy><NormalDepthCalc /></Lazy> },
      { path: 'ch4/classification', element: <Lazy><ReachClassificationCalc /></Lazy> },
      // Ch5
      { path: 'ch5/taxonomy', element: <Lazy><ProfileTaxonomyCalc /></Lazy> },
      { path: 'ch5/composite', element: <Lazy><CompositeProfileCalc /></Lazy> },
      // Ch6
      { path: 'ch6/standard-step', element: <Lazy><StandardStepCalc /></Lazy> },
      { path: 'ch6/profiles', element: <Lazy><WaterSurfaceProfileCalc /></Lazy> },
      { path: 'ch6/multi-reach', element: <Lazy><MultiReachCalc /></Lazy> },
      // Ch7
      { path: 'ch7/fall-velocity', element: <Lazy><FallVelocityCalc /></Lazy> },
      { path: 'ch7/shields', element: <Lazy><ShieldsCalc /></Lazy> },
      { path: 'ch7/bed-load', element: <Lazy><BedLoadCalc /></Lazy> },
      // Tools
      { path: 'design-wizard', element: <Lazy><DesignWizard /></Lazy> },
      { path: 'cheat-sheet', element: <Lazy><CheatSheet /></Lazy> },
      { path: 'workflow', element: <Lazy><WorkflowBuilder /></Lazy> },
      // Reference
      { path: 'reference', element: <ReferencePage /> },
      // Case Studies
      { path: 'case-studies', element: <Lazy><CaseStudiesPage /></Lazy> },
      { path: 'case-studies/:id', element: <Lazy><CaseStudyDetail /></Lazy> },
      // Batch Calculator
      { path: 'batch', element: <Lazy><BatchCalculatorPage /></Lazy> },
    ],
  },
  // Embed routes
  {
    path: '/embed',
    element: <Lazy><EmbedLayout /></Lazy>,
    children: [
      { path: 'ch1/geometry', element: <Lazy><ChannelGeometryCalc /></Lazy> },
      { path: 'ch1/froude', element: <Lazy><FroudeNumberCalc /></Lazy> },
      { path: 'ch2/energy', element: <Lazy><SpecificEnergyCalc /></Lazy> },
      { path: 'ch2/critical-depth', element: <Lazy><CriticalDepthCalc /></Lazy> },
      { path: 'ch4/manning', element: <Lazy><ManningCalc /></Lazy> },
      { path: 'ch4/normal-depth', element: <Lazy><NormalDepthCalc /></Lazy> },
      { path: 'ch6/standard-step', element: <Lazy><StandardStepCalc /></Lazy> },
      { path: 'ch6/profiles', element: <Lazy><WaterSurfaceProfileCalc /></Lazy> },
    ],
  },
]);
