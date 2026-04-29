import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatAED, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EnquiriesByMonthChart, ListingsByAreaChart } from '@/components/admin/KpiCharts';
import { DashboardHero } from '@/components/dashboard/DashboardHero';

export const metadata = { title: 'Admin', robots: { index: false } };

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function lastNMonths(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

export default async function AdminOverviewPage() {
  const session = await auth();
  const [
    totalListings,
    publishedListings,
    pendingListings,
    draftListings,
    archivedListings,
    totalUsers,
    managerCount,
    totalEnquiries,
    newEnquiries,
    pendingViewings,
    enquiries,
    listingsWithArea,
    recentEnquiries,
    pendingForReview,
    topAgents,
  ] = await Promise.all([
    db.listing.count(),
    db.listing.count({ where: { status: 'PUBLISHED' } }),
    db.listing.count({ where: { status: 'PENDING' } }),
    db.listing.count({ where: { status: 'DRAFT' } }),
    db.listing.count({ where: { status: 'ARCHIVED' } }),
    db.user.count(),
    db.user.count({ where: { role: 'MANAGER' } }),
    db.enquiry.count(),
    db.enquiry.count({ where: { status: 'NEW' } }),
    db.viewingRequest.count({ where: { status: 'PENDING' } }),
    db.enquiry.findMany({ select: { createdAt: true } }),
    db.listing.findMany({ select: { areaId: true, area: { select: { name: true } } } }),
    db.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { listing: { select: { title: true, slug: true, reference: true } } },
    }),
    db.listing.findMany({
      where: { status: 'PENDING' },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { area: { select: { name: true } }, agent: { select: { name: true } } },
    }),
    db.listing.groupBy({
      by: ['agentId'],
      where: { status: 'PUBLISHED' },
      _count: true,
      orderBy: { _count: { agentId: 'desc' } },
      take: 5,
    }),
  ]);

  // Build monthly enquiry series (last 12 months)
  const monthlyMap = new Map<string, number>();
  for (const m of lastNMonths(12)) monthlyMap.set(m, 0);
  for (const e of enquiries) {
    const k = monthKey(new Date(e.createdAt));
    if (monthlyMap.has(k)) monthlyMap.set(k, (monthlyMap.get(k) ?? 0) + 1);
  }
  const monthlyData = Array.from(monthlyMap.entries()).map(([month, count]) => ({
    month: month.slice(5) + '/' + month.slice(2, 4),
    count,
  }));

  // Listings per area
  const areaCounts = new Map<string, number>();
  for (const l of listingsWithArea) {
    areaCounts.set(l.area.name, (areaCounts.get(l.area.name) ?? 0) + 1);
  }
  const areaData = Array.from(areaCounts.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);

  // Top agents — resolve names
  const agentIds = topAgents.map((a) => a.agentId);
  const agentNames = agentIds.length
    ? await db.user.findMany({ where: { id: { in: agentIds } }, select: { id: true, name: true } })
    : [];
  const agentNameMap = Object.fromEntries(agentNames.map((a) => [a.id, a.name]));

  return (
    <div className="space-y-12">
      <DashboardHero
        name={session!.user.name ?? 'Admin'}
        role="ADMIN"
        kpis={[
          { label: 'Total listings',  value: totalListings,    tone: 'gold'   as const },
          { label: 'Published',       value: publishedListings, tone: 'sage'   as const },
          { label: 'Pending approval', value: pendingListings, tone: 'sunset' as const, highlight: pendingListings > 0 },
          { label: 'New enquiries',   value: newEnquiries,      tone: 'gulf'   as const, highlight: newEnquiries > 0 },
        ]}
      />

      {/* Secondary KPI strip */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-line py-8 md:grid-cols-4">
        <Stat label="Drafts"              value={draftListings} />
        <Stat label="Archived"            value={archivedListings} />
        <Stat label="Pending viewings"    value={pendingViewings} />
        <Stat label="Users / managers"    value={`${totalUsers}/${managerCount}`} />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="border border-line bg-bone p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Enquiries · last 12 months</p>
          <p className="mt-3 font-display text-3xl tracking-editorial">{totalEnquiries} total</p>
          <div className="mt-6">
            <EnquiriesByMonthChart data={monthlyData} />
          </div>
        </div>

        <div className="border border-line bg-bone p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Listings by area</p>
          <p className="mt-3 font-display text-3xl tracking-editorial">{listingsWithArea.length} on the books</p>
          <div className="mt-6">
            <ListingsByAreaChart data={areaData} />
          </div>
        </div>
      </section>

      {/* Approval queue snippet + Top agents */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl tracking-editorial md:text-3xl">Awaiting approval</h2>
            <Link
              href="/admin/listings/pending"
              className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink"
            >
              Full queue →
            </Link>
          </div>
          {pendingForReview.length === 0 ? (
            <p className="text-sm text-mute">Inbox zero. Nothing to approve.</p>
          ) : (
            <div className="overflow-hidden border border-line bg-bone">
              <table className="w-full text-sm">
                <thead className="bg-sand/30 text-left text-xs uppercase tracking-[0.18em] text-mute">
                  <tr>
                    <th className="px-4 py-3 font-normal">Reference</th>
                    <th className="px-4 py-3 font-normal">Title</th>
                    <th className="px-4 py-3 font-normal">Agent</th>
                    <th className="px-4 py-3 text-right font-normal">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {pendingForReview.map((l) => (
                    <tr key={l.id} className="hover:bg-sand/20">
                      <td className="px-4 py-3 font-mono text-xs">{l.reference}</td>
                      <td className="max-w-xs px-4 py-3">
                        <Link href={`/dashboard/listings/${l.id}/edit`} className="hover:text-gold">
                          {l.title.length > 60 ? l.title.slice(0, 60) + '…' : l.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-mute">{l.agent.name.split(' ')[0]}</td>
                      <td className="tnum px-4 py-3 text-right">{formatAED(l.price, { compact: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-display text-2xl tracking-editorial md:text-3xl">Top agents</h2>
          {topAgents.length === 0 ? (
            <p className="text-sm text-mute">No published listings yet.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {topAgents.map((a, i) => (
                <li key={a.agentId} className="flex items-baseline justify-between py-3">
                  <div>
                    <span className="mr-3 font-mono text-[11px] text-mute">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm">{agentNameMap[a.agentId] ?? '—'}</span>
                  </div>
                  <span className="tnum text-sm">{a._count} listings</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Recent enquiries */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-editorial md:text-3xl">Recent enquiries</h2>
          <Link href="/dashboard/enquiries" className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink">
            All →
          </Link>
        </div>
        <div className="overflow-hidden border border-line bg-bone">
          <table className="w-full text-sm">
            <thead className="bg-sand/30 text-left text-xs uppercase tracking-[0.18em] text-mute">
              <tr>
                <th className="px-4 py-3 font-normal">When</th>
                <th className="px-4 py-3 font-normal">From</th>
                <th className="px-4 py-3 font-normal">About</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 text-right font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentEnquiries.map((e) => (
                <tr key={e.id} className="hover:bg-sand/20">
                  <td className="px-4 py-3 text-xs text-mute">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">
                    {e.listing ? (
                      <Link href={`/listings/${e.listing.slug}`} className="hover:text-gold">{e.listing.title}</Link>
                    ) : <span className="text-mute italic">General</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] uppercase">{e.type}</td>
                  <td className="px-4 py-3 text-right"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight, href }: { label: string; value: number | string; highlight?: boolean; href?: string }) {
  const inner = (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">{label}</p>
      <p className={`tnum mt-2 font-display text-4xl tracking-editorial ${highlight ? 'text-gold' : ''}`}>
        {value}
      </p>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-70" data-cursor="open">
        {inner}
      </Link>
    );
  }
  return <div>{inner}</div>;
}
