import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AreasGrid } from '@/components/public/AreasGrid';

export const metadata: Metadata = {
  title: 'Areas',
  description: 'The six places we know intimately — Saadiyat, Reem, Yas, Hudayriyat, Corniche, Yas Bay.',
};

// Hits SQLite at render time — DB only exists at runtime.
export const dynamic = 'force-dynamic';

export default async function AreasPage() {
  const areas = await db.area.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, slug: true, name: true, tagline: true, heroImageUrl: true, startingPrice2BhkSale: true },
  });

  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial mb-16 md:mb-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Areas</p>
        <h1 className="mt-4 max-w-[18ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
          Six places we know intimately.
        </h1>
        <p className="mt-8 max-w-[60ch] text-base text-ink/80">
          Six islands and one coastal road. We have walked the towers, seen the floor plates, and shown buyers and tenants through every one. What follows is what we actually think.
        </p>
      </div>
      <AreasGrid areas={areas} />
    </div>
  );
}
