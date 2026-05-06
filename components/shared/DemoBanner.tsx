/**
 * Visual indicator that DEMO_MODE is active. Renders nothing in normal builds.
 * Server-rendered, no JS needed. Set DEMO_MODE=0 (or remove the env var) to
 * turn it off and re-enable real auth.
 */
export function DemoBanner() {
  if (process.env.DEMO_MODE !== '1') return null;
  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-gold px-4 py-1.5 text-center text-[10px] uppercase tracking-[0.22em] text-ink">
      <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
      <span>Demo mode — login bypassed · do not ship to production</span>
    </div>
  );
}
