import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { formatAED, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DashboardListingFilters } from '@/components/dashboard/DashboardListingFilters';
import { ListingRowActions } from '@/components/dashboard/ListingRowActions';

export const metadata = { title: 'Listings · Dashboard', robots: { index: false } };

const filtersSchema = z.object({
  q: z.string().max(80).optional(),
  area: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'RESERVED', 'SOLD_RENTED', 'ARCHIVED']).optional(),
  listingType: z.enum(['SALE', 'RENT', 'LEASE']).optional(),
  page: z.coerce.number().int().min(1).default(1),
});
const PER_PAGE = 20;

interface PageProps { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function DashboardListingsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === 'ADMIN';

  const raw = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const f = filtersSchema.safeParse(flat).success
    ? filtersSchema.parse(flat)
    : filtersSchema.parse({});

  let areaId: string | undefined;
  if (f.area) {
    const a = await db.area.findUnique({ where: { slug: f.area }, select: { id: true } });
    if (a) areaId = a.id;
  }

  const where = {
    ...(isAdmin ? {} : { agentId: userId }),
    ...(f.status && { status: f.status }),
    ...(f.listingType && { listingType: f.listingType }),
    ...(areaId && { areaId }),
    ...(f.q && {
      OR: [
        { title: { contains: f.q } },
        { reference: { contains: f.q } },
      ],
    }),
  };

  const [listings, total, areas] = await Promise.all([
    db.listing.findMany({
      where,
      include: { area: { select: { name: true } }, agent: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: (f.page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.listing.count({ where }),
    db.area.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">
            {isAdmin ? 'All listings' : 'My listings'}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
            {total} {total === 1 ? 'property' : 'properties'}
          </h1>
        </div>
        <Link
          href="/dashboard/listings/new"
          data-cursor="new listing"
          className="group inline-flex items-center gap-3 self-start bg-ink px-6 py-3 text-bone transition-colors hover:bg-gulf md:self-auto"
        >
          <span className="text-[11px] uppercase tracking-[0.28em]">Add listing</span>
          <span className="text-lg leading-none">+</span>
        </Link>
      </div>

      <div className="rounded-none border border-line bg-bone p-4">
        <DashboardListingFilters areas={areas} />
      </div>

      {listings.length === 0 ? (
        <div className="border border-line bg-bone p-16 text-center">
          <p className="font-display text-3xl tracking-editorial">Nothing here.</p>
          <p className="mt-3 text-mute">
            {f.q || f.status || f.listingType || f.area
              ? 'Try widening your filters.'
              : 'Add your first listing to get started.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-line bg-bone">
          <table className="w-full text-sm">
            <thead className="bg-sand/30 text-left text-xs uppercase tracking-[0.18em] text-mute">
              <tr>
                <th className="px-4 py-3 font-normal">Reference</th>
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal">Area</th>
                {isAdmin && <th className="px-4 py-3 font-normal">Agent</th>}
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Updated</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listings.map((l) => {
                const isOwner = l.agentId === userId;
                return (
                  <tr key={l.id} className="hover:bg-sand/20">
                    <td className="px-4 py-3 font-mono text-xs">{l.reference}</td>
                    <td className="max-w-xs px-4 py-3">
                      <Link href={`/dashboard/listings/${l.id}/edit`} className="hover:text-gold">
                        {l.title.length > 60 ? l.title.slice(0, 60) + '…' : l.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-mute">{l.area.name}</td>
                    {isAdmin && <td className="px-4 py-3 text-mute">{l.agent.name.split(' ')[0]}</td>}
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                        {l.listingType}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                    <td className="tnum px-4 py-3 text-right">
                      {formatAED(l.price, { compact: true })}
                      {l.listingType === 'RENT' ? '/yr' : ''}
                    </td>
                    <td className="px-4 py-3 text-xs text-mute">{formatDate(l.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <ListingRowActions
                        listingId={l.id}
                        status={l.status}
                        isAdmin={isAdmin}
                        isOwner={isOwner}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between border-t border-line pt-6 text-xs uppercase tracking-[0.18em]">
          {f.page > 1 ? (
            <Link href={`?${new URLSearchParams({ ...flat, page: String(f.page - 1) } as Record<string, string>).toString()}`} className="hover:text-gold">
              ← Previous
            </Link>
          ) : <span className="text-mute">← Previous</span>}
          <span className="text-mute">Page {f.page} of {totalPages}</span>
          {f.page < totalPages ? (
            <Link href={`?${new URLSearchParams({ ...flat, page: String(f.page + 1) } as Record<string, string>).toString()}`} className="hover:text-gold">
              Next →
            </Link>
          ) : <span className="text-mute">Next →</span>}
        </nav>
      )}
    </div>
  );
}
