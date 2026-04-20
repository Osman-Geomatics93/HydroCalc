import { getAllProfiles } from '../../../lib/gvf/profiles';
import { FormulaDisplay } from '../../shared';

export default function ProfileTaxonomyCalc() {
  const profiles = getAllProfiles();

  const slopeGroups = ['Mild', 'Steep', 'Critical', 'Horizontal', 'Adverse'] as const;
  const colors: Record<string, string> = {
    Mild: 'bg-[var(--color-surface)] border-[var(--color-border)]',
    Steep: 'bg-[var(--color-surface)] border-[var(--color-border)]',
    Critical: 'bg-[var(--color-surface)] border-[var(--color-border)]',
    Horizontal: 'bg-[var(--color-surface)] border-[var(--color-border)]',
    Adverse: 'bg-[var(--color-surface)] border-[var(--color-border)]',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 5</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>GVF Profile Taxonomy</h1>
      </div>

      <FormulaDisplay latex="\\frac{dy}{dx} = \\frac{S_0 - S_f}{1 - Fr^2}" />

      <p className="text-sm text-[var(--color-text-muted)]">
        The 12 GVF profiles are classified by slope type (M, S, C, H, A) and zone (1, 2, 3).
        Zone 1 is above both yn and yc, zone 2 is between, and zone 3 is below both.
      </p>

      {slopeGroups.map((group) => {
        const groupProfiles = profiles.filter((p) => p.slopeClass === group);
        if (groupProfiles.length === 0) return null;

        return (
          <div key={group} className="space-y-2">
            <h3 className="font-semibold text-[var(--color-text)]">{group} Slope</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {groupProfiles.map((p) => (
                <div key={p.type} className={`rounded-[6px] border p-4 ${colors[group]}`}>
                  <div className="text-lg font-bold">{p.type}</div>
                  <div className="text-xs text-[var(--color-text-subtle)] mt-1">{p.depthRelation}</div>
                  <div className="text-sm font-medium text-[var(--color-text)] mt-1">{p.description}</div>
                  <div className="text-xs text-[var(--color-text-subtle)] mt-2">{p.behavior}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
