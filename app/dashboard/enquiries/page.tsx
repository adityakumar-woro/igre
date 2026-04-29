import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatAED, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ConvertEnquiryButton } from '@/components/dashboard/ConvertEnquiryButton';

export const metadata = { title: 'Enquiries · Dashboard', robots: { index: false } };

interface PageProps { searchParams: Promise<{ status?: string }> }

const FILTERS = [
  { v: '',          label: 'All' },
  { v: 'NEW',       label: 'New' },
  { v: 'CONTACTED', label: 'Contacted' },
];

export default async function EnquiriesPage({ searchParams }: PageProps) {
  const session = await auth();
  const isAdmin = session!.user.role === 'ADMIN';
  const { status } = await searchParams;

  // For Phase 2 we show all enquiries to ADMIN and to MANAGER (the spec eventually
  // assigns enquiries to a specific agent — that mechanic comes with /admin assign).
  // For now, MANAGER sees everything in the queue.
  const where = {
    ...(status && ['NEW', 'CONTACTED', 'VIEWING_SCHEDULED', 'NEGOTIATING', 'WON', 'LOST'].includes(status) && { status }),
  };

  const enquiries = await db.enquiry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { id: true, slug: true, title: true, reference: true } },
      lead: { select: { id: true } },
    },
    take: 100,
  });

  const counts = {
    all: await db.enquiry.count(),
    new: await db.enquiry.count({ where: { status: 'NEW' } }),
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Enquiries</p>
          <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
            {counts.new} new of {counts.all}.
          </h1>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.v}
              href={f.v ? `?status=${f.v}` : `/dashboard/enquiries`}
              className={`border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition ${
                (status ?? '') === f.v ? 'border-ink bg-ink text-bone' : 'border-line text-mute hover:border-ink hover:text-ink'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {enquiries.length === 0 ? (
        <div className="border border-line bg-bone p-16 text-center">
          <p className="font-display text-3xl tracking-editorial">Inbox zero.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => (
            <li key={e.id} className="border border-line bg-bone p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h2 className="font-display text-2xl tracking-editorial">{e.name}</h2>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{e.type}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-xs text-mute">
                    <a href={`mailto:${e.email}`} className="hover:text-gold" data-cursor="email">{e.email}</a>
                    <a href={`tel:${e.phone}`} className="hover:text-gold" data-cursor="call">{e.phone}</a>
                    <span>{formatDate(e.createdAt)}</span>
                    {e.budget && <span className="tnum text-ink">{formatAED(e.budget, { compact: true })}</span>}
                    {e.preferredArea && <span>Looking in {e.preferredArea}</span>}
                  </div>

                  {e.listing && (
                    <p className="mt-3 text-xs text-mute">
                      Re:{' '}
                      <Link href={`/dashboard/listings/${e.listing.id}/edit`} className="text-ink hover:text-gold">
                        {e.listing.reference} — {e.listing.title}
                      </Link>
                    </p>
                  )}

                  <p className="mt-4 max-w-[80ch] whitespace-pre-line text-sm text-ink/85">{e.message}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {e.lead ? (
                    <Link
                      href={`/dashboard/leads/${e.lead.id}`}
                      className="text-[11px] uppercase tracking-[0.18em] text-success hover:text-ink"
                    >
                      View lead →
                    </Link>
                  ) : (
                    <ConvertEnquiryButton
                      enquiry={{
                        id: e.id,
                        name: e.name,
                        email: e.email,
                        phone: e.phone,
                        budget: e.budget,
                        message: e.message,
                        listingId: e.listingId,
                      }}
                    />
                  )}
                  <a
                    href={`https://wa.me/${e.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink"
                    data-cursor="whatsapp"
                  >
                    WhatsApp ↗
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isAdmin && (
        <p className="text-xs italic text-mute">
          Phase 3 will let admins assign enquiries to specific agents.
        </p>
      )}
    </div>
  );
}
