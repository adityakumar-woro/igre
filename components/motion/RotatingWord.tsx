'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  words: string[];
  intervalMs?: number;
  className?: string;
}

/**
 * Rotates through a list of words, animating each in/out from below.
 * Used in the hero headline to swap "told properly · sold properly · …".
 */
export function RotatingWord({ words, intervalMs = 2400, className }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  // Use the longest word to set width so the layout doesn't jitter.
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), '');

  return (
    <span className={className} style={{ display: 'inline-block', position: 'relative' }}>
      {/* Phantom for sizing */}
      <span style={{ visibility: 'hidden' }}>{longest}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-110%', opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', inset: 0, display: 'inline-block' }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
