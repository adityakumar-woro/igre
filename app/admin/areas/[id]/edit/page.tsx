import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { AreaEditForm } from '@/components/admin/AreaEditForm';
import { safeJsonArray } from '@/lib/utils';

export const metadata = { title: 'Edit area · Admin', robots: { index: false } };

interface PageProps { params: Promise<{ id: string }> }

export default async function EditAreaPage({ params }: PageProps) {
  const { id } = await params;
  const area = await db.area.findUnique({ where: { id } });
  if (!area) notFound();

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/admin/areas" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
            ← All areas
          </Link>
          <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-mute">Edit area</p>
          <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">{area.name}</h1>
          <p className="mt-2 font-mono text-xs text-mute">/{area.slug}</p>
        </div>
        <Link
          href={`/areas/${area.slug}`}
          target="_blank"
          className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink"
          data-cursor="open"
        >
          View live ↗
        </Link>
      </div>

      <AreaEditForm
        initial={{
          id: area.id,
          slug: area.slug,
          name: area.name,
          tagline: area.tagline,
          description: area.description,
          heroImageUrl: area.heroImageUrl,
          images: safeJsonArray<string>(area.images),
          startingPrice2BhkSale: area.startingPrice2BhkSale,
          startingPrice3BhkSale: area.startingPrice3BhkSale,
          startingPriceVillaSale: area.startingPriceVillaSale,
          startingPrice2BhkRent: area.startingPrice2BhkRent,
          startingPrice3BhkRent: area.startingPrice3BhkRent,
          startingPriceVillaRent: area.startingPriceVillaRent,
          freehold: area.freehold,
          distanceToAirportKm: area.distanceToAirportKm,
          isFeatured: area.isFeatured,
          sortOrder: area.sortOrder,
        }}
      />
    </div>
  );
}
