// Formatting helpers used everywhere on the public site & dashboards.

export function formatAED(value: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
    if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  }
  return `AED ${new Intl.NumberFormat('en-AE').format(value)}`;
}

export function formatSqft(value: number): string {
  return `${new Intl.NumberFormat('en-AE').format(value)} sqft`;
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function bedLabel(beds: number, prop?: string): string {
  if (prop === 'STUDIO') return 'Studio';
  return `${beds}BR`;
}
