import { Link } from 'react-router-dom';
import { BookOpen, Clock, BarChart3 } from 'lucide-react';
import { CASE_STUDIES } from '../constants/case-studies';
import { useCaseStudyProgress } from '../hooks/useCaseStudyProgress';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function CaseStudiesPage() {
  const { getProgressPercent } = useCaseStudyProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Learning</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Real-World Case Studies
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)] text-sm max-w-2xl">
          Work through guided engineering scenarios that connect multiple calculators together,
          simulating real hydraulic design and analysis workflows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CASE_STUDIES.map((cs) => {
          const pct = getProgressPercent(cs.id, cs.steps.length);
          return (
            <Link
              key={cs.id}
              to={`/case-studies/${cs.id}`}
              className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-5 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-sm)] transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
                  <h2 className="font-semibold text-[var(--color-text)]">{cs.title}</h2>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[cs.difficulty]}`}>
                  {cs.difficulty}
                </span>
              </div>

              <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">
                {cs.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{cs.estimatedMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" /> {cs.steps.length} steps
                </span>
                {pct > 0 && (
                  <span className="text-[var(--color-accent)] font-medium">{pct}% complete</span>
                )}
              </div>

              {pct > 0 && (
                <div className="mt-3 h-1.5 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
