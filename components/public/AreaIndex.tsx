'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface AreaIndexItem {
  id: string;
  slug: string;
  name: string;
  startingPrice2BhkSale: number | null;
  heroImageUrl: string;
}

const FOCUS_AREAS = [
  'Abu Dhabi Corniche Road',
  'Al Reem Island',
  'Al Saadiyat Island',
  'Yas Island',
  'Ferrari World / Yas Bay',
  'Al Nahiyan',
  'Al Bateen',
  'MBZ - Mohammed Bin Zayed City',
  'Khalifa City A',
  'Al Raha',
  'Zayed City',
  'Shakhbout City',
  'Al Reef',
  'Baniyas',
  'Al Riyadh City',
  'Al Shamkha',
];

export function AreaIndex({ areas }: { areas: AreaIndexItem[] }) {
  const featured = areas.slice(0, 6);

  return (
    <section className="relative isolate overflow-hidden bg-ivory">
      <div className="container-editorial relative z-10 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Abu Dhabi coverage</p>
            <h2 className="mt-4 max-w-[14ch] font-display text-4xl leading-[1.05] tracking-editorial md:text-6xl">
              The areas clients ask us about most.
            </h2>
            <p className="mt-6 max-w-[46ch] text-sm leading-[1.7] text-ink/70">
              We work across Abu Dhabi, but these island, city, and mainland communities come up every day for sale and rental enquiries.
            </p>
            <Link href="/areas" className="mt-8 inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-mute hover:text-ink">
              Browse all areas
              <span className="h-px w-12 bg-ink" />
            </Link>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {featured.map((area, i) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                >
                  <Link href={`/areas/${area.slug}`} className="group block overflow-hidden rounded-sm border border-line bg-bone">
                    <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={area.heroImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-2 truncate font-display text-xl leading-none tracking-editorial">
                        {area.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {FOCUS_AREAS.slice(6).map((area) => (
                <span key={area} className="rounded-full border border-line bg-bone px-3 py-1 text-[11px] text-ink/70">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
