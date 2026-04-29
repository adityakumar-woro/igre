'use client';

import { motion } from 'framer-motion';

/**
 * Footer marquee — slow drift of the area names. Looped seamlessly.
 */
export function FooterMarquee({ items }: { items: string[] }) {
  const track = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex shrink-0 whitespace-nowrap"
        initial={{ x: '0%' }}
        animate={{ x: '-50%' }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {track.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8 px-8 py-5 md:gap-12 md:px-12">
            <span className="font-display text-2xl tracking-editorial text-bone/70 md:text-3xl">
              {item}
            </span>
            <span className="text-gold">★</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
