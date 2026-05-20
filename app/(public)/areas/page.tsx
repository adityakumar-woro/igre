import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { AreasGrid } from '@/components/public/AreasGrid';

export const metadata: Metadata = {
  title: 'Areas',
  description: 'Abu Dhabi areas for sale and rent — islands, mainland villa communities, and established city neighbourhoods.',
};

// Hits SQLite at render time — DB only exists at runtime.
export const dynamic = 'force-dynamic';

export default async function AreasPage() {
  const areas = await db.area.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, slug: true, name: true, tagline: true, heroImageUrl: true, startingPrice2BhkSale: true },
  });

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink pt-32 text-bone md:pt-40">
        <div className="absolute inset-0 grid grid-cols-3 opacity-45">
          {areas.slice(0, 3).map((area) => (
            <div key={area.id} className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={area.heroImageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />

        <div className="container-editorial relative z-10 pb-20 md:pb-28">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-bone/65">Areas</p>
              <h1 className="mt-4 max-w-[12ch] font-display text-6xl leading-[0.92] tracking-editorial md:text-8xl">
                Abu Dhabi areas for sale and rent.
              </h1>
            </div>
            <div className="md:col-span-5">
              <p className="max-w-[46ch] text-base leading-[1.75] text-bone/78">
                From Corniche and Al Reem apartments to mainland family villas in MBZ, Khalifa City A, Zayed City, Shakhbout, Al Riyadh, and Al Shamkha, these are the neighbourhoods clients ask us about most.
              </p>
              <div className="mt-8 grid grid-cols-3 border-y border-bone/20 py-5 text-center">
                <div>
                  <p className="font-display text-4xl leading-none">{areas.length}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-bone/55">Areas</p>
                </div>
                <div className="border-x border-bone/15">
                  <p className="font-display text-4xl leading-none">Sale</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-bone/55">Options</p>
                </div>
                <div>
                  <p className="font-display text-4xl leading-none">Rent</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-bone/55">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AreasGrid areas={areas} />
    </div>
  );
}
