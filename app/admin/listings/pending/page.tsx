import Link from 'next/link';
import { db } from '@/lib/db';
import { formatAED, formatDate, formatSqft } from '@/lib/format';
import { PendingActions } from '@/components/admin/PendingActions';

export const metadata = { title: 'Approval queue · Admin', robots: { index: false } };

export default async function PendingApprovalPage() {
  const pending = await db.listing.findMany({
    where: { status: 'PENDING' },
    orderBy: { updatedAt: 'asc' },
    include: {
      area: { select: { name: true } },
      agent: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Approval queue</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
          {pending.length === 0 ? 'Inbox zero.' : `${pending.length} ${pending.length === 1 ? 'listing' : 'listings'} awaiting review.`}
        </h1>
      </div>

      {pending.length === 0 ? (
        <div className="border border-line bg-bone p-16 text-center">
          <p className="font-display text-3xl tracking-editorial">All clear.</p>
          <p className="mt-3 text-mute">No listings pending review.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {pending.map((l) => (
            <li key={l.id} className="border border-line bg-bone">
              <div className="flex flex-col gap-6 p-6 md:flex-row md:gap-8">
                {/* Cover preview */}
                <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-sand md:w-64">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.coverImageUrl} alt="" className="h-full w-full object-cover" />
                </div>

                {/* Detail */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-xs text-mute">{l.reference}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                      {l.listingType} · {l.propertyType}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl leading-[1.2] tracking-editorial">
                    {l.title}
                  </h2>
                  <p className="tnum mt-3 text-sm text-mute">
                    {l.bedrooms}BR · {l.bathrooms} bath · {formatSqft(l.sqft)} ·{' '}
                    <span className="text-gold">{formatAED(l.price, { compact: true })}</span>
                    {l.listingType === 'RENT' ? '/yr' : ''}
                  </p>
                  <p className="mt-2 text-xs text-mute">
                    {l.area.name} · {l.fullAddress}
                  </p>
                  <p className="mt-4 max-w-[80ch] text-sm text-ink/80">
                    {l.description.length > 220 ? l.description.slice(0, 220) + '…' : l.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-6">
                    <div className="text-xs text-mute">
                      <span>Submitted by </span>
                      <span className="text-ink">{l.agent.name}</span>
                      <span> · {formatDate(l.updatedAt)}</span>
                    </div>
                    <Link
                      href={`/dashboard/listings/${l.id}/edit`}
                      className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink"
                      data-cursor="edit"
                    >
                      Open ↗
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:flex md:items-center">
                  <PendingActions listingId={l.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
