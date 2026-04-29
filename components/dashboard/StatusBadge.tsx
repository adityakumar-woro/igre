import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  DRAFT: 'border-line text-mute bg-bone',
  PENDING: 'border-gold/30 text-gold bg-gold/5',
  PUBLISHED: 'border-success/30 text-success bg-success/5',
  RESERVED: 'border-gulf/30 text-gulf bg-gulf/5',
  SOLD_RENTED: 'border-mute/30 text-mute bg-sand',
  ARCHIVED: 'border-mute/30 text-mute bg-sand',
  // Lead statuses
  NEW: 'border-gold/30 text-gold bg-gold/5',
  CONTACTED: 'border-gulf/30 text-gulf bg-gulf/5',
  VIEWING_SCHEDULED: 'border-gulf/30 text-gulf bg-gulf/5',
  NEGOTIATING: 'border-gold/30 text-gold bg-gold/5',
  WON: 'border-success/30 text-success bg-success/5',
  LOST: 'border-danger/30 text-danger bg-danger/5',
  // Viewing statuses
  CONFIRMED: 'border-success/30 text-success bg-success/5',
  COMPLETED: 'border-mute/30 text-mute bg-sand',
  CANCELLED: 'border-danger/30 text-danger bg-danger/5',
};

const LABEL: Record<string, string> = {
  SOLD_RENTED: 'Closed',
  VIEWING_SCHEDULED: 'Viewing',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STYLES[status] ?? STYLES.DRAFT;
  const label = LABEL[status] ?? status.replace(/_/g, ' ');
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]',
        cls,
      )}
    >
      {label}
    </span>
  );
}
