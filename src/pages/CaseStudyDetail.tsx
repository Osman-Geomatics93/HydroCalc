import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import { CASE_STUDIES } from '../constants/case-studies';
import { useCaseStudyProgress } from '../hooks/useCaseStudyProgress';

export default function CaseStudyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCompletedSteps, markStepComplete } = useCaseStudyProgress();

  const study = CASE_STUDIES.find((cs) => cs.id === id);
  if (!study) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Case study not found.</p>
        <Link to="/case-studies" className="text-[var(--color-accent)] text-sm mt-2 inline-block">Back to Case Studies</Link>
      </div>
    );
  }

  const completed = getCompletedSteps(study.id);

  const buildCalcUrl = (path: string, params: Record<string, string | number>) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      search.set(k, String(v));
    }
    return `${path}?${search.toString()}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/case-studies')}
        className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Case Studies
      </button>

      <div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          {study.title}
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)] text-sm">{study.description}</p>
      </div>

      {/* Progress summary */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--color-accent)] font-medium">
          {completed.length}/{study.steps.length} steps complete
        </span>
        <div className="flex-1 h-2 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
            style={{ width: `${(completed.length / study.steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {study.steps.map((step, idx) => {
          const isDone = completed.includes(idx);
          const url = buildCalcUrl(step.calculatorPath, step.params);

          return (
            <div
              key={idx}
              className={`bg-[var(--color-surface)] border rounded-[6px] p-4 transition-colors ${
                isDone ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--color-text-subtle)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[var(--color-text-subtle)] font-medium">Step {idx + 1}</span>
                    <h3 className="font-semibold text-[var(--color-text)] text-sm">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-3">{step.description}</p>
                  <div className="flex items-center gap-2">
                    <Link
                      to={url}
                      onClick={() => markStepComplete(study.id, idx)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-accent)] text-white rounded-[6px] text-xs font-medium hover:opacity-90"
                    >
                      <ExternalLink className="w-3 h-3" /> Open in Calculator
                    </Link>
                    {!isDone && (
                      <button
                        onClick={() => markStepComplete(study.id, idx)}
                        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                      >
                        Mark complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
