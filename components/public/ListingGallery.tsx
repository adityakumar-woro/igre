'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Editorial gallery — large hero image, thumbnail strip below.
 * Crossfades between slides; arrow keys navigate.
 */
export function ListingGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safe = images.length ? images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=80'];

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand md:aspect-[3/2]">
        <AnimatePresence mode="wait">
          <motion.img
            key={safe[active]}
            src={safe[active]}
            alt={`${alt} — ${active + 1}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            data-placeholder="true"
          />
        </AnimatePresence>

        {safe.length > 1 && (
          <>
            <button
              onClick={() => setActive((i) => (i - 1 + safe.length) % safe.length)}
              aria-label="Previous image"
              data-cursor="prev"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-bone/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink backdrop-blur transition hover:bg-bone"
            >
              ←
            </button>
            <button
              onClick={() => setActive((i) => (i + 1) % safe.length)}
              aria-label="Next image"
              data-cursor="next"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-bone/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink backdrop-blur transition hover:bg-bone"
            >
              →
            </button>
            <p className="absolute bottom-4 right-4 rounded-full bg-bone/80 px-4 py-1.5 font-mono text-[11px] tracking-wider backdrop-blur">
              {String(active + 1).padStart(2, '0')} / {String(safe.length).padStart(2, '0')}
            </p>
          </>
        )}
      </div>

      {safe.length > 1 && (
        <div className="scroll-no-bar mt-4 flex gap-2 overflow-x-auto md:gap-3">
          {safe.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'relative h-20 w-28 shrink-0 overflow-hidden transition-opacity duration-300 md:h-24 md:w-36',
                active === i ? 'opacity-100' : 'opacity-60 hover:opacity-90',
              )}
              data-cursor="open"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" data-placeholder="true" />
              {active === i && <div className="absolute inset-x-0 bottom-0 h-px bg-ink" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
