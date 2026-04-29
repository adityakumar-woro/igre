import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ListingCard } from '@/components/public/ListingCard';
import { RevealImage } from '@/components/motion/RevealImage';
import { formatAED } from '@/lib/format';
import { safeJsonArray } from '@/lib/utils';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const a = await db.area.findUnique({ where: { slug }, select: { name: true, tagline: true } });
  if (!a) return { title: 'Area' };
  return { title: a.name, description: a.tagline };
}

export default async function AreaPage({ params }: PageProps) {
  const { slug } = await params;
  const area = await db.area.findUnique({ where: { slug } });
  if (!area) notFound();

  const listings = await db.listing.findMany({
    where: { areaId: area.id, status: 'PUBLISHED' },
    include: { area: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 9,
  });

  const galleryImages = safeJsonArray<string>(area.images);

  const priceRows: Array<{ label: string; sale: number | null; rent: number | null }> = [
    { label: '2BHK', sale: area.startingPrice2BhkSale, rent: area.startingPrice2BhkRent },
    { label: '3BHK', sale: area.startingPrice3BhkSale, rent: area.startingPrice3BhkRent },
    { label: 'Villa', sale: area.startingPriceVillaSale, rent: area.startingPriceVillaRent },
  ].filter((r) => r.sale !== null || r.rent !== null);

  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial">
        <Link href="/areas" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">← All areas</Link>
        <p className="mt-12 text-[11px] uppercase tracking-[0.28em] text-mute">{area.freehold ? 'Freehold' : 'Leasehold'} · {area.distanceToAirportKm ? `${area.distanceToAirportKm}km from AUH` : 'Abu Dhabi'}</p>
        <h1 className="mt-4 max-w-[20ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-8xl">
          {area.name}
        </h1>
        <p className="mt-8 max-w-[55ch] font-display text-2xl leading-[1.15] text-ink/80 md:text-3xl">
          {area.tagline}
        </p>
      </div>

      <div className="container-editorial mt-20">
        <RevealImage src={area.heroImageUrl} alt={area.name} className="aspect-[16/9] w-full" priority />
      </div>

      <div className="container-editorial mt-24 grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Starting prices</p>
          <table className="tnum mt-6 w-full border-y border-line text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-mute">
                <th className="border-b border-line py-3 font-normal">Type</th>
                <th className="border-b border-line py-3 text-right font-normal">Sale</th>
                <th className="border-b border-line py-3 text-right font-normal">Rent / yr</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((r) => (
                <tr key={r.label}>
                  <td className="border-b border-line py-3">{r.label}</td>
                  <td className="border-b border-line py-3 text-right">{r.sale ? formatAED(r.sale, { compact: true }) : '—'}</td>
                  <td className="border-b border-line py-3 text-right">{r.rent ? formatAED(r.rent, { compact: true }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs italic text-mute">
            Indicative starting price based on current market data. Actual prices vary by tower, view, and finish.
          </p>
        </div>
        <div className="md:col-span-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">About {area.name}</p>
          <p className="mt-6 whitespace-pre-line text-base leading-[1.7] text-ink/85">
            {area.description}
          </p>
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div className="container-editorial mt-24 grid grid-cols-1 gap-6 md:grid-cols-3">
          {galleryImages.slice(1, 4).map((src, i) => (
            <RevealImage key={i} src={src} alt="" className="aspect-[3/4]" />
          ))}
        </div>
      )}

      {listings.length > 0 && (
        <section className="container-editorial mt-32">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-3xl tracking-editorial md:text-5xl">
              On {area.name} right now.
            </h2>
            <Link href={`/listings?area=${area.slug}`} className="text-[11px] uppercase tracking-[0.28em] text-mute hover:text-ink" data-cursor="see all">
              All ({listings.length}) →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
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
        </section>
      )}
    </div>
  );
}
