'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

interface RevealTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  stagger?: number;
  once?: boolean;
}

/**
 * Splits a string by word and reveals each one from below with a stagger.
 * Respects prefers-reduced-motion via the global CSS rule.
 */
export function RevealText({
  children,
  className,
  as = 'h2',
  stagger = 0.04,
  once = true,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: '0px 0px -10% 0px' });

  const words = children.split(' ');

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger } },
  };

  const word: Variants = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  };

  const Component = motion[as];

  return (
    <Component ref={ref as never} className={className} aria-label={children}>
      <motion.span
        variants={container}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        aria-hidden
        className="inline-block"
      >
        {words.map((w, i) => (
          <span key={i} className="reveal-word mr-[0.25em]">
            <motion.span variants={word} className="inline-block">
              {w}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}
