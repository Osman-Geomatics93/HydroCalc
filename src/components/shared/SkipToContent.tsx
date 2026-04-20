export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-white focus:rounded-[6px] focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
    >
      Skip to content
    </a>
  );
}
