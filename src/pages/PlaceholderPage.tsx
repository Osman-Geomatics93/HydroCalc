interface PlaceholderPageProps {
  title: string;
  chapter: number;
}

export default function PlaceholderPage({ title, chapter }: PlaceholderPageProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter {chapter}</div>
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
      <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-subtle)]">
        Calculator coming soon...
      </div>
    </div>
  );
}
