import Link from 'next/link';
import { db } from '@/lib/db';
import { formatAED } from '@/lib/format';

export const metadata = { title: 'Areas · Admin', robots: { index: false } };

export default async function AdminAreasPage() {
  const areas = await db.area.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { listings: true } } },
  });

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Areas</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
          Six places, edited from here.
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm text-mute">
          Click any area to update its content, hero photography, and starting prices.
          Changes go live immediately on the public site.
        </p>
      </div>

      <ul className="space-y-3">
        {areas.map((a) => (
          <li key={a.id}>
            <Link
              href={`/admin/areas/${a.id}/edit`}
              data-cursor="edit"
              className="group flex flex-col gap-4 border border-line bg-bone p-6 hover:border-ink md:flex-row md:items-stretch md:p-0"
            >
              <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-sand md:aspect-auto md:w-72">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.heroImageUrl} alt="" className="h-full w-full object-cover" data-placeholder="true" />
              </div>
              <div className="flex flex-1 flex-col justify-between md:p-8">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
                      {String(a.sortOrder).padStart(2, '0')}
                    </span>
                    {a.isFeatured && (
                      <span className="bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                        featured
                      </span>
                    )}
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                      {a.freehold ? 'Freehold' : 'Leasehold'}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl tracking-editorial md:text-3xl">{a.name}</h2>
                  <p className="mt-2 max-w-[60ch] text-sm text-mute">{a.tagline}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-mute">
                  <span>{a._count.listings} listings</span>
                  {a.startingPrice2BhkSale && (
                    <span>2BR sale from <span className="tnum text-ink">{formatAED(a.startingPrice2BhkSale, { compact: true })}</span></span>
                  )}
                  {a.startingPrice3BhkSale && (
                    <span>3BR sale from <span className="tnum text-ink">{formatAED(a.startingPrice3BhkSale, { compact: true })}</span></span>
                  )}
                  {a.startingPriceVillaSale && (
                    <span>Villa from <span className="tnum text-ink">{formatAED(a.startingPriceVillaSale, { compact: true })}</span></span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end pr-6 text-mute group-hover:text-ink md:pr-8">
                <span className="text-2xl transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
