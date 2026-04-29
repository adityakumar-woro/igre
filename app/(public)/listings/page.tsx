import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ListingCard } from '@/components/public/ListingCard';
import { ListingFilters } from '@/components/public/ListingFilters';
import Link from 'next/link';
import { listingFiltersSchema } from '@/lib/validations/listing';

export const metadata: Metadata = {
  title: 'Listings',
  description: 'Apartments, villas, and townhouses for sale and rent across Abu Dhabi.',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const parsed = listingFiltersSchema.safeParse(flat);
  const filters = parsed.success ? parsed.data : listingFiltersSchema.parse({});

  // Translate "area" slug to areaId
  let areaId: string | undefined;
  if (filters.area) {
    const a = await db.area.findUnique({ where: { slug: filters.area }, select: { id: true } });
    if (a) areaId = a.id;
  }

  const where = {
    status: 'PUBLISHED' as const,
    ...(filters.listingType && { listingType: filters.listingType }),
    ...(filters.propertyType && { propertyType: filters.propertyType }),
    ...(typeof filters.bedrooms === 'number' && { bedrooms: { gte: filters.bedrooms } }),
    ...(areaId && { areaId }),
    ...(filters.q && {
      OR: [
        { title: { contains: filters.q } },
        { description: { contains: filters.q } },
      ],
    }),
    ...((filters.minPrice || filters.maxPrice) && {
      price: {
        ...(filters.minPrice && { gte: filters.minPrice }),
        ...(filters.maxPrice && { lte: filters.maxPrice }),
      },
    }),
  };

  const orderBy = filters.sort === 'price_asc'
    ? { price: 'asc' as const }
    : filters.sort === 'price_desc'
      ? { price: 'desc' as const }
      : { createdAt: 'desc' as const };

  const [listings, total, areas] = await Promise.all([
    db.listing.findMany({
      where,
      include: { area: { select: { name: true } } },
      orderBy,
      skip: (filters.page - 1) * filters.perPage,
      take: filters.perPage,
    }),
    db.listing.count({ where }),
    db.area.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / filters.perPage));

  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial">
        <div className="mb-16 flex flex-col gap-8 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">All listings</p>
            <h1 className="mt-4 max-w-[16ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
              {total} {total === 1 ? 'property' : 'properties'} on the books.
            </h1>
          </div>
        </div>

        <div className="mb-16 border-y border-line py-6">
          <ListingFilters areas={areas} />
        </div>

        {listings.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-3xl tracking-editorial">Nothing matches these filters.</p>
            <p className="mt-3 text-mute">Try widening your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard
                key={l.id}
                eager={i < 3}
                listing={{
                  id: l.id,
                  slug: l.slug,
                  reference: l.reference,
                  title: l.title,
                  bedrooms: l.bedrooms,
                  sqft: l.sqft,
                  price: l.price,
                  listingType: l.listingType,
                  propertyType: l.propertyType,
                  coverImageUrl: l.coverImageUrl,
                  area: l.area,
                }}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-24 flex items-center justify-between border-t border-line pt-6 text-xs uppercase tracking-[0.18em]">
            <Pager currentPage={filters.page} totalPages={totalPages} />
          </nav>
        )}
      </div>
    </div>
  );
}

function Pager({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  // Server-rendered pagination — relies on URL params
  return (
    <>
      {currentPage > 1 ? (
        <Link href={`?page=${currentPage - 1}`} className="hover:text-gold">← Previous</Link>
      ) : <span className="text-mute">← Previous</span>}
      <span className="text-mute">Page {currentPage} of {totalPages}</span>
      {currentPage < totalPages ? (
        <Link href={`?page=${currentPage + 1}`} className="hover:text-gold">Next →</Link>
      ) : <span className="text-mute">Next →</span>}
    </>
  );
}
