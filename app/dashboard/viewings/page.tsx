import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ViewingStatusActions } from '@/components/dashboard/ViewingStatusActions';

export const metadata = { title: 'Viewings · Dashboard', robots: { index: false } };

interface PageProps { searchParams: Promise<{ filter?: string }> }

const FILTERS = [
  { v: 'upcoming', label: 'Upcoming' },
  { v: 'all',      label: 'All' },
  { v: 'past',     label: 'Past' },
];

export default async function ViewingsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === 'ADMIN';

  const { filter = 'upcoming' } = await searchParams;
  const today = new Date(new Date().toDateString());

  // For Phase 2: MANAGER sees viewings for their own listings; ADMIN sees all.
  const where = {
    ...(isAdmin ? {} : { listing: { agentId: userId } }),
    ...(filter === 'upcoming' && {
      preferredDate: { gte: today },
      status: { in: ['PENDING', 'CONFIRMED'] },
    }),
    ...(filter === 'past' && { preferredDate: { lt: today } }),
  };

  const viewings = await db.viewingRequest.findMany({
    where,
    orderBy: filter === 'past' ? { preferredDate: 'desc' } : { preferredDate: 'asc' },
    include: {
      listing: { select: { id: true, slug: true, title: true, reference: true, agentId: true } },
    },
    take: 100,
  });

  // Group by date for the upcoming view
  const groups = new Map<string, typeof viewings>();
  for (const v of viewings) {
    const key = formatDate(v.preferredDate);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(v);
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Viewings</p>
          <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
            {viewings.length} {viewings.length === 1 ? 'viewing' : 'viewings'}.
          </h1>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.v}
              href={`?filter=${f.v}`}
              className={`border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition ${
                filter === f.v ? 'border-ink bg-ink text-bone' : 'border-line text-mute hover:border-ink hover:text-ink'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {viewings.length === 0 ? (
        <div className="border border-line bg-bone p-16 text-center">
          <p className="font-display text-3xl tracking-editorial">Nothing scheduled.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Array.from(groups.entries()).map(([dateLabel, items]) => (
            <section key={dateLabel}>
              <p className="mb-4 font-display text-2xl tracking-editorial">{dateLabel}</p>
              <ul className="space-y-3">
                {items.map((v) => (
                  <li key={v.id} className="border border-line bg-bone p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3">
                          <span className="tnum font-mono text-sm text-gold">{v.preferredTime}</span>
                          <h3 className="font-display text-xl tracking-editorial">{v.name}</h3>
                          <StatusBadge status={v.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-mute">
                          <a href={`tel:${v.phone}`} className="hover:text-gold" data-cursor="call">{v.phone}</a>
                          <a href={`mailto:${v.email}`} className="hover:text-gold" data-cursor="email">{v.email}</a>
                        </div>
                        <p className="mt-3 text-xs text-mute">
                          Property:{' '}
                          <Link href={`/dashboard/listings/${v.listing.id}/edit`} className="text-ink hover:text-gold">
                            {v.listing.reference} — {v.listing.title}
                          </Link>
                        </p>
                        {v.notes && <p className="mt-2 text-sm text-ink/85">{v.notes}</p>}
                      </div>

                      <div className="shrink-0">
                        <ViewingStatusActions id={v.id} status={v.status} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
