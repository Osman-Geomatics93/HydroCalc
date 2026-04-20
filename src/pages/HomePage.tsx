import { Link } from 'react-router-dom';
import { Ruler, Zap, ArrowRightLeft, Waves, TrendingUp, GitBranch, Mountain } from 'lucide-react';

const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface ChapterCard {
  chapter: number;
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

const chapters: ChapterCard[] = [
  { chapter: 1, title: 'Introduction', description: 'Channel geometry, Froude number, basic flow properties', link: '/ch1/geometry', icon: <Ruler className="w-5 h-5" /> },
  { chapter: 2, title: 'Energy', description: 'Specific energy diagrams, critical depth, alternate depths, obstructions', link: '/ch2/energy', icon: <Zap className="w-5 h-5" /> },
  { chapter: 3, title: 'Momentum', description: 'Momentum function, hydraulic jump, conjugate depths', link: '/ch3/momentum', icon: <ArrowRightLeft className="w-5 h-5" /> },
  { chapter: 4, title: 'Uniform Flow', description: "Manning's equation, normal depth, reach classification", link: '/ch4/manning', icon: <Waves className="w-5 h-5" /> },
  { chapter: 5, title: 'Qualitative GVF', description: 'Profile taxonomy (M1-A3), composite profiles', link: '/ch5/taxonomy', icon: <TrendingUp className="w-5 h-5" /> },
  { chapter: 6, title: 'Quantitative GVF', description: 'Standard step method, water surface profiles', link: '/ch6/standard-step', icon: <GitBranch className="w-5 h-5" /> },
  { chapter: 7, title: 'Sediment Transport', description: 'Fall velocity, Shields diagram, bed load transport', link: '/ch7/fall-velocity', icon: <Mountain className="w-5 h-5" /> },
];

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-12 animate-in animate-in-1">
        <h1
          className="font-bold text-[var(--color-text)] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          HydroCalc
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg prose-width">
          Interactive calculators and visualizations for open channel flow hydraulics,
          based on <em>Fundamentals of Open Channel Flow</em> by Moglen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((ch, i) => (
          <Link
            key={ch.chapter}
            to={ch.link}
            className={`group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-4 sm:p-6 hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-300 animate-in animate-in-${i + 2}`}
            style={{ transitionTimingFunction: 'var(--ease-premium)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[var(--color-accent)]">{ch.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                Chapter {ch.chapter}
              </span>
            </div>
            <h3
              className="text-lg font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-accent)] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {ch.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">{ch.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-5 bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
        <strong className="text-[var(--color-text)]">Features:</strong> SI/US unit toggle, interactive Plotly charts,
        PDF export, real-time calculations, and formula display with KaTeX.
      </div>

      <footer className="mt-8 pt-6 border-t border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[var(--color-text-muted)]">
            Built by <span className="font-medium text-[var(--color-text)]">Osman Ibrahim</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Osman-Geomatics93"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
            >
              <GitHubIcon />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/osman-ibrahim-a02a9a197/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
            >
              <LinkedInIcon />
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
