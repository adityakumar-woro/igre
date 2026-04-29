'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatAED } from '@/lib/format';

export interface AreaCard {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  heroImageUrl: string;
  startingPrice2BhkSale: number | null;
}

const ACCENTS = ['gold', 'sunset', 'gulf', 'sage', 'rose', 'amber'] as const;
const ACCENT_BAR: Record<typeof ACCENTS[number], string> = {
  gold: 'bg-gold', sunset: 'bg-sunset', gulf: 'bg-gulf',
  sage: 'bg-sage', rose: 'bg-rose', amber: 'bg-amber',
};
const ACCENT_TEXT: Record<typeof ACCENTS[number], string> = {
  gold: 'text-gold', sunset: 'text-sunset', gulf: 'text-gulf',
  sage: 'text-sage', rose: 'text-rose', amber: 'text-amber',
};

/**
 * "Areas we know" — staggered, asymmetric layout.
 *   - 2-column on desktop, alternating offset (every other card pushed down)
 *   - Each card has a coloured top-bar that draws across on hover
 *   - Image scales on hover, coloured overlay tints on hover
 *   - Animated drift blob in the background
 */
export function AreasGrid({ areas }: { areas: AreaCard[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-bone">
      {/* Drifting decorative blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/3 h-[60vmax] w-[60vmax] rounded-full opacity-25 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--rose) 0%, transparent 60%)', filter: 'blur(140px)' }}
        animate={{ x: ['0%', '8%', '-4%', '0%'], y: ['0%', '-6%', '4%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-editorial relative z-10 py-32 md:py-44">
        <div className="mb-20 flex flex-col items-baseline gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-[20ch] font-display text-4xl leading-[1.05] tracking-editorial md:text-7xl">
            Areas we know.
          </h2>
          <Link
            href="/areas"
            data-cursor="all areas"
            className="group inline-flex items-baseline gap-3 self-start md:self-auto"
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-mute group-hover:text-ink">
              See all six
            </span>
            <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 md:gap-y-24">
          {areas.map((a, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (i % 2) * 0.1 }}
                className={i % 2 === 1 ? 'md:translate-y-32' : ''}
              >
                <Link href={`/areas/${a.slug}`} data-cursor="enter" className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_30px_60px_-30px_rgba(14,17,22,0.4)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.heroImageUrl}
                      alt={a.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.06]"
                      data-placeholder="true"
                      loading="lazy"
                    />
                    {/* Bottom shadow for legibility */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />

                    {/* Colour-bar that scales across on hover */}
                    <span className={`absolute left-0 top-0 h-1 w-12 ${ACCENT_BAR[accent]} origin-left transition-transform duration-700 ease-editorial group-hover:scale-x-[20]`} />

                    {/* Top-right counter */}
                    <span className={`absolute right-5 top-5 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/80 ${ACCENT_TEXT[accent]}`}>
                      {String(i + 1).padStart(2, '0')} / {String(areas.length).padStart(2, '0')}
                    </span>

                    {/* Caption block on the image */}
                    <div className="absolute inset-x-6 bottom-6 text-bone">
                      <h3 className="font-display text-3xl leading-[1.1] tracking-editorial md:text-5xl">
                        {a.name}
                      </h3>
                      <p className="mt-3 max-w-[28ch] text-sm leading-[1.5] text-bone/80">{a.tagline}</p>
                    </div>
                  </div>

                  {/* Below-card meta row */}
                  <div className="mt-5 flex items-baseline justify-between gap-4 px-1">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                      {a.startingPrice2BhkSale
                        ? `From ${formatAED(a.startingPrice2BhkSale, { compact: true })}`
                        : ''}
                    </span>
                    <span className="text-mute transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
