import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, ChevronDown, ChevronRight, Menu, X, Star,
  Ruler, Zap, ArrowRightLeft, Waves, TrendingUp, GitBranch, Mountain,
  Wand2, FileText, GitMerge, BookOpen, Table2
} from 'lucide-react';

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

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useFavorites } from '../../hooks/useFavorites';

interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Ch 1: Introduction',
    icon: <Ruler className="w-4 h-4" />,
    items: [
      { label: 'Channel Geometry', path: '/ch1/geometry' },
      { label: 'Froude Number', path: '/ch1/froude' },
    ],
  },
  {
    title: 'Ch 2: Energy',
    icon: <Zap className="w-4 h-4" />,
    items: [
      { label: 'Specific Energy (E-y)', path: '/ch2/energy' },
      { label: 'Critical Depth', path: '/ch2/critical-depth' },
      { label: 'Alternate Depths', path: '/ch2/alternate-depths' },
      { label: 'Channel Obstructions', path: '/ch2/obstructions' },
    ],
  },
  {
    title: 'Ch 3: Momentum',
    icon: <ArrowRightLeft className="w-4 h-4" />,
    items: [
      { label: 'Momentum Function (M-y)', path: '/ch3/momentum' },
      { label: 'Hydraulic Jump', path: '/ch3/hydraulic-jump' },
      { label: 'Combined Problems', path: '/ch3/combined' },
    ],
  },
  {
    title: 'Ch 4: Uniform Flow',
    icon: <Waves className="w-4 h-4" />,
    items: [
      { label: "Manning's Equation", path: '/ch4/manning' },
      { label: 'Normal Depth', path: '/ch4/normal-depth' },
      { label: 'Reach Classification', path: '/ch4/classification' },
    ],
  },
  {
    title: 'Ch 5: Qualitative GVF',
    icon: <TrendingUp className="w-4 h-4" />,
    items: [
      { label: 'Profile Taxonomy', path: '/ch5/taxonomy' },
      { label: 'Composite Profiles', path: '/ch5/composite' },
    ],
  },
  {
    title: 'Ch 6: Quantitative GVF',
    icon: <GitBranch className="w-4 h-4" />,
    items: [
      { label: 'Standard Step Method', path: '/ch6/standard-step' },
      { label: 'Water Surface Profiles', path: '/ch6/profiles' },
      { label: 'Multi-Reach Profile', path: '/ch6/multi-reach' },
    ],
  },
  {
    title: 'Ch 7: Sediment Transport',
    icon: <Mountain className="w-4 h-4" />,
    items: [
      { label: 'Fall Velocity', path: '/ch7/fall-velocity' },
      { label: 'Shields Diagram', path: '/ch7/shields' },
      { label: 'Bed Load Transport', path: '/ch7/bed-load' },
    ],
  },
];

// Collect all nav items for favorites lookup
const allNavItems = navGroups.flatMap((g) => g.items);

function NavGroupComponent({ group }: { group: NavGroup }) {
  const [open, setOpen] = useLocalStorage(`hydro-nav-${group.title}`, true);
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)] rounded-[6px] transition-[background-color,color] duration-200"
      >
        {group.icon}
        <span className="flex-1 text-left">{group.title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="ml-4 border-l border-[var(--color-border-light)] pl-2 mt-0.5">
          {group.items.map((item) => (
            <div key={item.path} className="flex items-center group/nav">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex-1 block px-3 py-1.5 text-sm rounded-[6px] transition-[background-color,color,border-color] duration-200 ${
                    isActive
                      ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium border-l-2 border-[var(--color-accent)] -ml-[2px] pl-[14px]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.path); }}
                className={`p-1 rounded transition-colors duration-150 ${
                  isFavorite(item.path)
                    ? 'text-amber-400'
                    : 'text-transparent group-hover/nav:text-[var(--color-text-subtle)] hover:!text-amber-400'
                }`}
                title={isFavorite(item.path) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className="w-3 h-3" fill={isFavorite(item.path) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { favorites } = useFavorites();

  const favoriteItems = favorites
    .map((path) => allNavItems.find((item) => item.path === path))
    .filter(Boolean) as NavItem[];

  const sidebarFooter = (
    <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
        Built by Osman Ibrahim
      </p>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/Osman-Geomatics93"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
          title="GitHub"
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>
        <a
          href="https://www.linkedin.com/in/osman-ibrahim-a02a9a197/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
          title="LinkedIn"
        >
          <LinkedInIcon />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );

  const sidebarContent = (
    <nav aria-label="Main navigation" className="p-3 space-y-1 overflow-y-auto flex-1">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-[6px] transition-[background-color,color] duration-200 mb-2 ${
            isActive
              ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
          }`
        }
      >
        <Home className="w-4 h-4" /> Home
      </NavLink>

      {/* Favorites section */}
      {favoriteItems.length > 0 && (
        <div className="mb-3">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-500 flex items-center gap-1.5">
            <Star className="w-3 h-3" fill="currentColor" /> Favorites
          </div>
          <div className="ml-4 pl-2 mt-0.5">
            {favoriteItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-1.5 text-sm rounded-[6px] transition-[background-color,color] duration-200 ${
                    isActive
                      ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {navGroups.map((group) => (
        <NavGroupComponent key={group.title} group={group} />
      ))}
      <div className="mt-4 mb-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
        Tools
      </div>
      <NavLink
        to="/design-wizard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-[background-color,color] duration-200 ${
            isActive
              ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
          }`
        }
      >
        <Wand2 className="w-4 h-4" /> Design Wizard
      </NavLink>
      <NavLink
        to="/workflow"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-[background-color,color] duration-200 ${
            isActive
              ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
          }`
        }
      >
        <GitMerge className="w-4 h-4" /> Workflow Builder
      </NavLink>
      <NavLink
        to="/case-studies"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-[background-color,color] duration-200 ${
            isActive
              ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
          }`
        }
      >
        <BookOpen className="w-4 h-4" /> Case Studies
      </NavLink>
      <NavLink
        to="/batch"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-[background-color,color] duration-200 ${
            isActive
              ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
          }`
        }
      >
        <Table2 className="w-4 h-4" /> Batch Calculator
      </NavLink>

      <div className="mt-3 mb-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
        Reference
      </div>
      <NavLink
        to="/cheat-sheet"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-[background-color,color] duration-200 ${
            isActive
              ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
          }`
        }
      >
        <FileText className="w-4 h-4" /> Formula Cheat Sheet
      </NavLink>
      <NavLink
        to="/reference"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 text-sm rounded-[6px] transition-[background-color,color] duration-200 ${
            isActive
              ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
          }`
        }
      >
        Reference Formulas
      </NavLink>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 right-4 z-50 bg-[var(--color-accent)] text-white p-2 rounded-[6px] shadow-[var(--shadow-md)] no-print"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--color-bg)] border-r border-[var(--color-border)] min-h-0">
        {sidebarContent}
        {sidebarFooter}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--color-surface)] shadow-[var(--shadow-lg)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
            {sidebarFooter}
          </aside>
        </div>
      )}
    </>
  );
}
