'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatAED, formatSqft } from '@/lib/format';

export interface FeaturedListingData {
  slug: string;
  title: string;
  bedrooms: number;
  sqft: number;
  price: number;
  listingType: string;
  coverImageUrl: string;
  area: { name: string };
  features: string[];
}

/**
 * Editorial Pick — full-bleed, dark, magazine cover layout.
 *   - Image fills the right 60% on desktop (full width on mobile)
 *   - Big editorial title overlapping image edge
 *   - Numbered facts column on left (BR · sqft · price)
 *   - Floating "Editorial pick" badge top-left
 *   - Animated colour wash behind everything
 */
export function FeaturedListing({ listing }: { listing: FeaturedListingData }) {
  const isRent = listing.listingType === 'RENT';
  const featureLine = listing.features.slice(0, 3).join(' · ');

  return (
    <section className="relative isolate overflow-hidden bg-ink text-bone">
      {/* Animated colour washes */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 h-[80vmax] w-[80vmax] rounded-full opacity-25 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--sunset) 0%, transparent 60%)', filter: 'blur(140px)' }}
        animate={{ x: ['0%', '6%', '-4%', '0%'], y: ['0%', '4%', '8%', '0%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 -bottom-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-30 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)', filter: 'blur(140px)' }}
        animate={{ x: ['0%', '-6%', '4%', '0%'], y: ['0%', '-4%', '8%', '0%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-editorial relative z-10 py-24 md:py-36">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left — meta + facts */}
          <div className="order-2 flex flex-col justify-between lg:order-1 lg:col-span-5">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3"
              >
                <span className="block h-2 w-2 animate-pulse rounded-full bg-gold" />
                <span className="text-[11px] uppercase tracking-[0.28em] text-bone/60">
                  Editorial pick · {listing.area.name}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 font-display text-4xl leading-[1.05] tracking-editorial md:text-6xl"
              >
                {listing.title}
              </motion.h2>

              {featureLine && (
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mt-6 max-w-[40ch] text-sm leading-[1.6] text-bone/70"
                >
                  {featureLine}
                </motion.p>
              )}
            </div>

            {/* Numbered facts */}
            <motion.dl
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-12 grid grid-cols-3 gap-6 border-t border-bone/15 pt-8"
            >
              <Fact label="Bedrooms" value={String(listing.bedrooms)} />
              <Fact label="Built-up" value={formatSqft(listing.sqft)} />
              <Fact label={isRent ? 'Annual rent' : 'Asking'} value={formatAED(listing.price, { compact: true })} accent />
            </motion.dl>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12"
            >
              <Link
                href={`/listings/${listing.slug}`}
                data-cursor="open"
                className="group inline-flex items-center gap-3 border border-bone/30 px-6 py-4 transition-colors hover:border-gold hover:bg-gold/10"
              >
                <span className="text-[11px] uppercase tracking-[0.28em]">See the property</span>
                <span className="block h-px w-12 bg-bone transition-all duration-500 group-hover:w-20 group-hover:bg-gold" />
              </Link>
            </motion.div>
          </div>

          {/* Right — image card with parallax-ish hover */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover="hover"
              className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]"
            >
              <motion.img
                src={listing.coverImageUrl}
                alt={listing.title}
                className="absolute inset-0 h-full w-full object-cover"
                variants={{ hover: { scale: 1.04 } }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                data-placeholder="true"
                loading="lazy"
              />
              {/* Gold edge */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
              {/* Top-left chip */}
              <div className="absolute left-5 top-5 rounded-full bg-bone/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink backdrop-blur-md">
                {isRent ? 'For rent' : 'For sale'}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">{label}</dt>
      <dd className={`tnum mt-2 font-display text-2xl tracking-editorial md:text-3xl ${accent ? 'text-gold' : 'text-bone'}`}>
        {value}
      </dd>
    </div>
  );
}
