'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface Props {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  cursor?: ReactNode; // optional cursor element after the text
}

/**
 * Letter-by-letter reveal — splits the string into words (and words into chars)
 * and animates each character up from below with a stagger. Whitespace is
 * preserved so layout doesn't break across line wraps.
 */
export function SplitText({
  children,
  className,
  delay = 0,
  stagger = 0.018,
  once = true,
  as = 'span',
  cursor,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: '0px 0px -10% 0px' });

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const letter: Variants = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
  };

  const words = children.split(' ');
  const Tag = motion[as];

  return (
    <Tag ref={ref as never} className={className} aria-label={children}>
      <motion.span
        variants={container}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        aria-hidden
        className="inline"
      >
        {words.map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {Array.from(w).map((ch, ci) => (
              <span key={ci} className="inline-block overflow-hidden align-baseline">
                <motion.span variants={letter} className="inline-block">{ch}</motion.span>
              </span>
            ))}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
        {cursor}
      </motion.span>
    </Tag>
  );
}
