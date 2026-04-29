'use client';

import { motion } from 'framer-motion';

interface Props {
  items: string[];
  duration?: number;
  className?: string;
  variant?: 'dark' | 'light';
}

/**
 * Edge-to-edge marquee strip — duplicates the content twice and animates the
 * inner track from 0 to -50% so the loop is seamless. Pauses on hover.
 */
export function AreasMarquee({ items, duration = 32, className, variant = 'dark' }: Props) {
  const tone = variant === 'dark' ? 'bg-ink text-bone' : 'bg-ivory text-ink';
  const sep = variant === 'dark' ? 'text-gold' : 'text-sunset';

  // Duplicate so the looped track has enough content
  const track = [...items, ...items];

  return (
    <div className={`group overflow-hidden ${tone} ${className ?? ''}`}>
      <motion.div
        className="flex shrink-0 whitespace-nowrap"
        initial={{ x: '0%' }}
        animate={{ x: '-50%' }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
        style={{ animationPlayState: 'running' }}
      >
        {track.map((item, i) => (
          <div key={i} className="flex shrink-0 items-center gap-8 px-8 py-4 md:gap-12 md:px-12">
            <span className="font-display text-3xl tracking-editorial md:text-5xl">{item}</span>
            <span className={`text-2xl ${sep}`}>•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
