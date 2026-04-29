import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatAED, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DashboardHero } from '@/components/dashboard/DashboardHero';

export const metadata = { title: 'Dashboard', robots: { index: false } };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === 'ADMIN';

  const listingFilter = isAdmin ? {} : { agentId: userId };
  const leadFilter = isAdmin ? {} : { agentId: userId };

  const [counts, openLeads, openEnquiries, recentEnquiries, todaysViewings, myListings] = await Promise.all([
    Promise.all([
      db.listing.count({ where: listingFilter }),
      db.listing.count({ where: { ...listingFilter, status: 'PUBLISHED' } }),
      db.listing.count({ where: { ...listingFilter, status: 'PENDING' } }),
      db.listing.count({ where: { ...listingFilter, status: 'DRAFT' } }),
    ]).then(([total, published, pending, drafts]) => ({ total, published, pending, drafts })),
    db.lead.count({ where: { ...leadFilter, status: { in: ['NEW', 'CONTACTED', 'NEGOTIATING', 'VIEWING_SCHEDULED'] } } }),
    db.enquiry.count({ where: { status: 'NEW' } }),
    db.enquiry.findMany({
      where: { status: { in: ['NEW', 'CONTACTED'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { listing: { select: { slug: true, title: true } } },
    }),
    db.viewingRequest.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        preferredDate: { gte: new Date(new Date().toDateString()) },
      },
    }),
    db.listing.findMany({
      where: listingFilter,
      orderBy: { updatedAt: 'desc' },
      include: { area: { select: { name: true } } },
      take: 8,
    }),
  ]);

  const kpis = [
    { label: isAdmin ? 'All listings' : 'My listings', value: counts.total,     tone: 'gold'   as const },
    { label: 'Published',                              value: counts.published, tone: 'sage'   as const },
    { label: 'Pending',                                value: counts.pending,   tone: 'sunset' as const, highlight: counts.pending > 0 },
    { label: 'Open leads',                             value: openLeads,        tone: 'gulf'   as const },
  ];

  return (
    <div className="space-y-12">
      <DashboardHero name={session!.user.name ?? 'Agent'} role={session!.user.role} kpis={kpis} />

      <section className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-3xl tracking-editorial md:text-4xl">
              {isAdmin ? 'Recent listings' : 'My listings'}
            </h2>
            <Link
              href="/dashboard/listings"
              className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink"
              data-cursor="open"
            >
              View all →
            </Link>
          </div>

          {myListings.length === 0 ? (
            <div className="border border-line bg-bone p-8 text-center">
              <p className="font-display text-2xl tracking-editorial">No listings yet.</p>
              <Link
                href="/dashboard/listings/new"
                className="mt-4 inline-block text-[11px] uppercase tracking-[0.28em] text-gold hover:text-ink"
              >
                Add your first listing →
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-sm border border-line bg-bone">
              <table className="w-full text-sm">
                <thead className="bg-sand/30 text-left text-xs uppercase tracking-[0.18em] text-mute">
                  <tr>
                    <th className="px-4 py-3 font-normal">Reference</th>
                    <th className="px-4 py-3 font-normal">Title</th>
                    <th className="px-4 py-3 font-normal">Area</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 text-right font-normal">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {myListings.map((l) => (
                    <tr key={l.id} className="hover:bg-sand/20">
                      <td className="px-4 py-3 font-mono text-xs">{l.reference}</td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/listings/${l.id}/edit`} className="hover:text-gold">
                          {l.title.length > 50 ? l.title.slice(0, 50) + '…' : l.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-mute">{l.area.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="tnum px-4 py-3 text-right">{formatAED(l.price, { compact: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-2xl tracking-editorial md:text-3xl">Recent enquiries</h2>
              <Link href="/dashboard/enquiries" className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink">
                All →
              </Link>
            </div>
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-mute">No open enquiries.</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {recentEnquiries.map((e) => (
                  <li key={e.id} className="py-4">
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="mt-1 truncate text-xs text-mute">
                      {e.listing ? e.listing.title : 'General'}
                    </p>
                    <p className="mt-1 text-xs text-mute">{formatDate(e.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-sm border border-line bg-gradient-to-br from-gold/10 to-sunset/10 p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Today</p>
            <p className="tnum mt-3 font-display text-4xl tracking-editorial text-gold">{todaysViewings}</p>
            <p className="mt-1 text-xs text-mute">upcoming viewings</p>
            <Link
              href="/dashboard/viewings"
              className="mt-6 inline-block text-[11px] uppercase tracking-[0.28em] text-gold hover:text-ink"
            >
              See calendar →
            </Link>
          </div>
          <p className="text-xs text-mute">{openEnquiries} new enquiries in queue.</p>
        </div>
      </section>
    </div>
  );
}
