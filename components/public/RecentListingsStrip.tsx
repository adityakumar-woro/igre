'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { formatAED, formatSqft } from '@/lib/format';

export interface StripListing {
  id: string;
  slug: string;
  reference: string;
  title: string;
  bedrooms: number;
  sqft: number;
  price: number;
  listingType: string;
  coverImageUrl: string;
  area: { name: string };
}

/**
 * Most Recent — magazine-style scroll-snap strip.
 *  - Edge-to-edge horizontal scroll
 *  - Cards with overlapping serif title that breaks the image edge
 *  - Live scroll-progress rail
 *  - Decorative animated colour wash behind
 */
export function RecentListingsStrip({ listings }: { listings: StripListing[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  const railWidth = useTransform(scrollXProgress, (v) => `${Math.max(8, v * 100)}%`);

  function scrollByAmount(dir: 1 | -1) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(360, el.clientWidth * 0.7), behavior: 'smooth' });
  }

  return (
    <section className="relative isolate overflow-hidden bg-bone">
      {/* Decorative blob */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 top-0 h-[55vmax] w-[55vmax] rounded-full opacity-25 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--sunset) 0%, transparent 60%)', filter: 'blur(120px)' }}
        animate={{ x: ['0%', '-6%', '4%', '0%'], y: ['0%', '8%', '-4%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10">
        <div className="container-editorial flex items-end justify-between gap-8 pb-12 pt-32 md:pt-44">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Most recent</p>
            <h2 className="mt-4 max-w-[18ch] font-display text-4xl leading-[1.05] tracking-editorial md:text-7xl">
              Just on the books.
            </h2>
            <p className="mt-4 max-w-[40ch] text-sm text-mute">
              Newest first. Drag the strip, swipe on touch, or use the arrows.
            </p>
          </div>
          <div className="hidden flex-col items-end gap-4 md:flex">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
              {listings.length.toString().padStart(2, '0')} listings
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => scrollByAmount(-1)}
                aria-label="Previous"
                data-cursor="prev"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bone transition-colors hover:bg-ink hover:text-bone"
              >
                ←
              </button>
              <button
                onClick={() => scrollByAmount(1)}
                aria-label="Next"
                data-cursor="next"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bone transition-colors hover:bg-ink hover:text-bone"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="scroll-no-bar flex gap-6 overflow-x-auto px-[max(1.5rem,5vw)] pb-12 md:gap-8"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {listings.map((l, i) => (
            <motion.article
              key={l.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (i % 6) * 0.06 }}
              className="group relative w-72 shrink-0 md:w-[26rem]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Link href={`/listings/${l.slug}`} data-cursor="open" className="block">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_30px_60px_-30px_rgba(14,17,22,0.4)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.06]"
                    data-placeholder="true"
                    loading="lazy"
                  />

                  <div className="absolute inset-x-5 top-5 flex items-center justify-between">
                    <span className="rounded-full bg-bone/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink backdrop-blur-md">
                      {l.listingType === 'RENT' ? 'For rent' : 'For sale'}
                    </span>
                    <span className="rounded-full bg-ink/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone backdrop-blur-md">
                      {l.area.name}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-6 text-bone">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70">
                      {l.reference}
                    </p>
                    <p className="tnum mt-2 font-display text-4xl tracking-editorial">
                      {formatAED(l.price, { compact: true })}
                      {l.listingType === 'RENT' && <span className="text-base text-bone/70"> /yr</span>}
                    </p>
                  </div>
                </div>

                {/* Overlapping title card */}
                <div className="relative -mt-12 ml-4 max-w-[24ch] rounded-sm bg-bone p-5 shadow-[0_20px_50px_-25px_rgba(14,17,22,0.4)] md:-mt-16 md:ml-6">
                  <p className="font-display text-xl leading-[1.15] tracking-editorial md:text-2xl">
                    {l.title.length > 64 ? l.title.slice(0, 64) + '…' : l.title}
                  </p>
                  <p className="tnum mt-3 text-xs text-mute">
                    {l.bedrooms}BR · {formatSqft(l.sqft)}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
          <div className="w-1 shrink-0" />
        </div>

        <div className="container-editorial pb-24">
          <div className="relative mx-auto h-px max-w-md bg-line">
            <motion.div className="absolute inset-y-0 left-0 bg-ink" style={{ width: railWidth }} />
          </div>
        </div>
      </div>
    </section>
  );
}
