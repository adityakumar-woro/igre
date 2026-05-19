'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [hover, setHover] = useState<number | null>(null);
  const fallbackImage = '/areas/abu-dhabi-property.svg';

  return (
    <section className="relative isolate overflow-hidden bg-bone">
      {/* Animated colour blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/3 top-0 h-[55vmax] w-[55vmax] rounded-full opacity-25 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--gulf) 0%, transparent 60%)', filter: 'blur(120px)' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[55vmax] w-[55vmax] rounded-full opacity-30 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)', filter: 'blur(120px)' }}
        animate={{ x: ['0%', '-6%', '4%', '0%'], y: ['0%', '8%', '-4%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-editorial relative z-10 py-32 md:py-44">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Abu Dhabi coverage</p>
            <p className="mt-6 max-w-[28ch] font-display text-2xl leading-[1.2] tracking-editorial md:text-3xl">
              We know all areas in Abu Dhabi, with special focus where clients ask most.
            </p>
            <p className="mt-4 max-w-[34ch] text-sm text-mute">
              From island apartments to mainland family villas, IGRE handles both sale and rent enquiries with area-specific guidance.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {FOCUS_AREAS.map((area) => (
                <span key={area} className="rounded-full border border-line bg-bone/70 px-3 py-1 text-[11px] text-ink/75">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-9">
            <ol className="relative">
              {areas.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  className="border-t border-line last:border-b"
                >
                  <Link
                    href={`/areas/${a.slug}`}
                    data-cursor="see area"
                    className="group grid grid-cols-12 items-center gap-4 py-7"
                  >
                    <span className="col-span-1 font-mono text-[11px] tracking-wider text-mute">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="col-span-7 flex items-center gap-4">
                      <motion.span
                        className="font-display text-3xl tracking-editorial md:text-5xl"
                        animate={{ x: hover === i ? 8 : 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {a.name}
                      </motion.span>
                      {/* Inline thumbnail that fades in on hover (mobile + desktop) */}
                      <AnimatePresence>
                        {hover === i && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -6 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="hidden h-12 w-20 overflow-hidden rounded-sm md:inline-block"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.heroImageUrl} alt="" className="h-full w-full object-cover" data-placeholder="true" onError={(e) => { e.currentTarget.src = fallbackImage; }} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>

                    <span className="col-span-3 text-right text-xs uppercase tracking-[0.18em] text-mute md:text-sm">
                      Sales & rent
                    </span>

                    <span className="col-span-1 text-right text-mute transition-transform duration-500 group-hover:translate-x-1">
                      ↗
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ol>

            {/* Floating big thumbnail (desktop only) */}
            <div className="pointer-events-none fixed right-12 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
              <AnimatePresence mode="wait">
                {hover !== null && (
                  <motion.div
                    key={areas[hover].id}
                    initial={{ opacity: 0, x: 30, scale: 0.94 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -30, scale: 0.94 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-80 w-60 overflow-hidden rounded-sm bg-sand shadow-[0_30px_80px_-30px_rgba(14,17,22,0.45)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={areas[hover].heroImageUrl} alt="" className="h-full w-full object-cover" data-placeholder="true" onError={(e) => { e.currentTarget.src = fallbackImage; }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <p className="mt-12 max-w-[68ch] text-xs italic text-mute">
          We cover apartments, villas, townhouses, and staff accommodation across Abu Dhabi. Availability changes quickly, so speak with us for live sale and rental options.
        </p>
      </div>
    </section>
  );
}
