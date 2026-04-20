# HydroCalc — Open Channel Flow Calculator

A comprehensive, interactive web application for open channel hydraulics calculations. Built for students, engineers, and researchers working in hydraulic engineering.

**Live Demo:** [hydro-calc.vercel.app](https://hydro-calc.vercel.app)

## Features

### Chapter Calculators

| Chapter | Calculators |
|---------|-------------|
| **Ch 1 — Geometry** | Channel Geometry, Froude Number |
| **Ch 2 — Energy** | Specific Energy (E-y), Critical Depth, Alternate Depths, Channel Obstructions |
| **Ch 3 — Momentum** | Momentum Function (M-y), Hydraulic Jump, Combined Energy & Momentum |
| **Ch 4 — Uniform Flow** | Manning's Equation, Normal Depth, Reach Classification |
| **Ch 5 — GVF** | Profile Taxonomy, Composite Profiles |
| **Ch 6 — Profiles** | Standard Step Method, Water Surface Profiles, Multi-Reach Profile |
| **Ch 7 — Sediment** | Fall Velocity, Shields Diagram, Bed Load Transport |

### Tools & Utilities

- **Design Wizard** — Guided channel design workflow
- **Batch Calculator** — Upload CSV, compute multiple scenarios at once
- **Case Studies** — Real-world guided exercises (Dam Spillway, Flood Channel, etc.)
- **Formula Cheat Sheet** — Quick reference for all equations
- **Workflow Builder** — Chain calculators together
- **Quick Converter** — Unit conversions at your fingertips
- **Share Cards** — Generate shareable calculation result images
- **PDF Reports** — Export professional calculation reports

### Interactive Features

- **Interactive Chart Dragging** — Click & drag on E-y and M-y diagrams to explore
- **3D Longitudinal Profiles** — 3D visualization of water surface, bed, and EGL
- **Parameter Sweep** — Sweep any input parameter and visualize sensitivity
- **Monte Carlo Analysis** — Probabilistic uncertainty analysis
- **Comparison Mode** — Compare two calculation scenarios side-by-side
- **Practice Problems** — Test your knowledge with auto-generated problems
- **Step-by-Step Solutions** — Detailed solution breakdowns
- **NLP Input** — Describe problems in natural language
- **Flow Animations** — Animated flow visualization
- **Smart Warnings** — Contextual engineering warnings and guidance

### App Features

- **Dark / Light / High-Contrast Themes**
- **SI / Imperial Unit Toggle** (Ctrl+U)
- **PWA / Offline Support** — Install as desktop/mobile app, works offline
- **Command Palette** (Ctrl+K) — Quick navigation
- **Slider Mode** — Adjust inputs with sliders for real-time feedback
- **Calculation History** — Browse and restore previous calculations
- **Progress Tracker** — Track your learning journey with badges
- **Undo / Redo** — Full calculation state undo/redo
- **Favorites & Presets** — Save and load parameter sets
- **Notes Panel** — Attach notes to any calculator
- **CSV Export** — Export results to spreadsheet
- **QR Code Sharing** — Share calculations via QR code
- **Present Mode** — Distraction-free presentation view
- **Embeddable Widgets** — Embed calculators in other sites via iframe
- **Internationalization** — Multi-language support
- **Accessibility** — Screen reader support, keyboard navigation, skip links, focus management

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev) | UI framework |
| [TypeScript 6](https://www.typescriptlang.org) | Type safety |
| [Vite 8](https://vite.dev) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [React Router 7](https://reactrouter.com) | Client-side routing |
| [Plotly.js](https://plotly.com/javascript/) | Interactive charts & 3D plots |
| [KaTeX](https://katex.org) | LaTeX math rendering |
| [Lucide React](https://lucide.dev) | Icons |
| [Vitest](https://vitest.dev) | Unit testing |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- npm 10+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/Osman-Geomatics93/HydroCalc.git
cd HydroCalc/hydro-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check & production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
hydro-app/
├── public/              # Static assets, SW, manifest
├── src/
│   ├── components/
│   │   ├── calculators/ # Calculator UIs (ch1-ch7)
│   │   ├── charts/      # Plotly chart components
│   │   ├── layout/      # AppLayout, Header, Sidebar
│   │   └── shared/      # Reusable UI components
│   ├── constants/       # Tutorials, case studies, problems
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core computation libraries
│   │   ├── solvers/     # Numerical solvers (bisection, etc.)
│   │   └── utils/       # Utilities (CSV, QR, clipboard, etc.)
│   ├── pages/           # Route page components
│   ├── router/          # React Router configuration
│   └── types/           # TypeScript type definitions
├── .github/workflows/   # CI/CD pipeline
└── vercel.json          # Vercel deployment config
```

## Deployment

The app is deployed on [Vercel](https://vercel.com). Every push to `main` triggers a production deployment. Pull requests get preview deployments.

## License

MIT
