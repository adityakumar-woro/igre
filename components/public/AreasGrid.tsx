'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface AreaCard {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  heroImageUrl: string;
  startingPrice2BhkSale: number | null;
}

const LOCATION_IMAGES: Record<string, string> = {
  'al-saadiyat-island': 'https://images.pexels.com/photos/21856196/pexels-photo-21856196.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'al-reem-island': 'https://cdn.pixabay.com/photo/2021/08/19/12/03/city-6557858_1280.jpg',
  'corniche-road': 'https://cdn.pixabay.com/photo/2020/06/02/06/30/abu-dhabi-5249641_1280.jpg',
  'yas-island': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Yas_Marina_Circuit_%2B_Ferrari_World_-Abu_Dhabi.jpg',
  'hudayriyat-island': 'https://cdn.pixabay.com/photo/2019/05/18/23/57/city-4212886_1280.jpg',
  'ferrari-yas-bay': 'https://images.pexels.com/photos/534151/pexels-photo-534151.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'al-nahiyan': 'https://cdn.pixabay.com/photo/2016/02/03/20/19/abu-dhabi-1177898_1280.jpg',
  'al-bateen': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Al_Bateen_Beach_2.jpg',
  'mohammed-bin-zayed-city': 'https://images.pexels.com/photos/8481173/pexels-photo-8481173.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'khalifa-city-a': 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'al-raha': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Al_Dar_Hq_architecutal_view.jpg',
  'zayed-city': 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'shakhbout-city': 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'al-reef': 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'baniyas': 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'al-riyadh-city': 'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'al-shamkha': 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1800',
};

const INTERNET_FALLBACK_IMAGE = 'https://cdn.pixabay.com/photo/2020/06/02/06/30/abu-dhabi-5249641_1280.jpg';

const ACCENTS = ['gold', 'sunset', 'gulf', 'sage', 'rose', 'amber'] as const;
const ACCENT_BAR: Record<typeof ACCENTS[number], string> = {
  gold: 'bg-gold', sunset: 'bg-sunset', gulf: 'bg-gulf',
  sage: 'bg-sage', rose: 'bg-rose', amber: 'bg-amber',
};
const ACCENT_TEXT: Record<typeof ACCENTS[number], string> = {
  gold: 'text-gold', sunset: 'text-sunset', gulf: 'text-gulf',
  sage: 'text-sage', rose: 'text-rose', amber: 'text-amber',
};

function areaImage(area: AreaCard) {
  return LOCATION_IMAGES[area.slug] ?? area.heroImageUrl ?? INTERNET_FALLBACK_IMAGE;
}

export function AreasGrid({ areas }: { areas: AreaCard[] }) {
  const [lead, ...rest] = areas;
  const topTiles = rest.slice(0, 4);
  const lowerTiles = rest.slice(4);

  return (
    <section className="relative isolate overflow-hidden bg-bone">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[50vmax] w-[50vmax] rounded-full opacity-20 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--rose) 0%, transparent 60%)', filter: 'blur(140px)' }}
        animate={{ x: ['0%', '8%', '-4%', '0%'], y: ['0%', '-6%', '4%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-editorial relative z-10 py-28 md:py-36">
        <div className="grid grid-cols-1 gap-10 border-b border-line pb-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Abu Dhabi area atlas</p>
            <h2 className="mt-4 max-w-[16ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
              Areas we serve.
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="max-w-[46ch] text-sm leading-[1.7] text-ink/70">
              Island apartments, waterfront addresses, and mainland villa communities. Each area uses a unique image, so the section stays specific and easy to scan.
            </p>
            <div className="mt-6 flex items-center justify-between border-y border-line py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                {String(areas.length).padStart(2, '0')} focus areas
              </span>
              <Link href="/areas" className="text-[11px] uppercase tracking-[0.22em] text-mute hover:text-ink">
                See all areas
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {lead && <LeadAreaCard area={lead} total={areas.length} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {topTiles.map((area, i) => (
              <AreaTile key={area.id} area={area} index={i + 2} total={areas.length} />
            ))}
          </div>
        </div>

        {lowerTiles.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {lowerTiles.map((area, i) => (
              <AreaTile key={area.id} area={area} index={i + 6} total={areas.length} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LeadAreaCard({ area, total }: { area: AreaCard; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="lg:col-span-5"
    >
      <Link href={`/areas/${area.slug}`} className="group block">
        <div className="relative min-h-[520px] overflow-hidden rounded-sm bg-ink shadow-[0_36px_90px_-50px_rgba(14,17,22,0.65)]">
          <AreaImage area={area} priority />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
          <div className="absolute inset-x-7 bottom-7 text-bone md:inset-x-9 md:bottom-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/60">
              01 / {String(total).padStart(2, '0')}
            </p>
            <h3 className="mt-4 max-w-[10ch] font-display text-5xl leading-[0.95] tracking-editorial md:text-7xl">
              {area.name}
            </h3>
            <p className="mt-5 max-w-[34ch] text-sm leading-[1.7] text-bone/75">
              {area.tagline}
            </p>
            <span className="mt-8 inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-gold">
              Explore area
              <span className="h-px w-12 bg-gold transition-all duration-500 group-hover:w-20" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function AreaTile({ area, index, total }: { area: AreaCard; index: number; total: number }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.04 }}
      className="min-w-0"
    >
      <Link href={`/areas/${area.slug}`} className="group grid h-full grid-cols-[7.25rem_1fr] overflow-hidden rounded-sm border border-line bg-bone transition-colors hover:border-ink/25 hover:bg-ivory">
        <div className="relative min-h-36 overflow-hidden bg-sand">
          <AreaImage area={area} />
          <span className={`absolute left-0 top-0 h-full w-1 ${ACCENT_BAR[accent]}`} />
        </div>
        <div className="flex min-w-0 flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${ACCENT_TEXT[accent]}`}>
                {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <span className="text-mute transition-transform group-hover:translate-x-1">→</span>
            </div>
            <h3 className="mt-3 truncate font-display text-2xl leading-[1] tracking-editorial">
              {area.name}
            </h3>
            <p className="mt-3 line-clamp-2 text-xs leading-[1.55] text-mute">
              {area.tagline}
            </p>
          </div>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
            Sales & rentals
          </p>
        </div>
      </Link>
    </motion.article>
  );
}

function AreaImage({ area, priority = false }: { area: AreaCard; priority?: boolean }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={areaImage(area)}
        alt={area.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.06]"
        loading={priority ? 'eager' : 'lazy'}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallbackApplied) return;
          img.dataset.fallbackApplied = 'true';
          img.src = INTERNET_FALLBACK_IMAGE;
        }}
      />
    </>
  );
}
