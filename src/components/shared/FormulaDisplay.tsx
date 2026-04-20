import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaDisplayProps {
  latex: string;
  block?: boolean;
}

export function FormulaDisplay({ latex, block = true }: FormulaDisplayProps) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: block,
  });

  return (
    <div
      className={`${block ? 'py-3 px-4 bg-[var(--color-bg-alt)] rounded-[6px] border border-[var(--color-border-light)] overflow-x-auto' : 'inline'}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
