'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * A two-layer custom cursor — dot + outline ring that lags behind on a spring.
 * Hides on touch devices (no-hover media query in CSS) and under prefers-reduced-motion.
 * Detects hover on `[data-cursor]` elements and morphs the ring.
 */
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 30, stiffness: 220, mass: 0.5 });
  const ringY = useSpring(y, { damping: 30, stiffness: 220, mass: 0.5 });

  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      if (!t || !ringRef.current) return;
      const label = t.dataset.cursor || '';
      ringRef.current.dataset.state = 'active';
      if (labelRef.current) labelRef.current.textContent = label;
    };

    const onOut = (e: MouseEvent) => {
      const from = (e.target as Element | null)?.closest?.('[data-cursor]');
      const to = (e.relatedTarget as Element | null)?.closest?.('[data-cursor]');
      if (from && !to && ringRef.current) {
        ringRef.current.dataset.state = 'idle';
        if (labelRef.current) labelRef.current.textContent = '';
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [x, y]);

  return (
    <>
      {/* Dot — exact pointer position */}
      <motion.div
        className="igre-cursor pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-ink mix-blend-difference"
        style={{ x, y }}
      />
      {/* Ring — lagged, morphs on data-cursor hover */}
      <motion.div
        ref={ringRef}
        data-state="idle"
        className="igre-cursor pointer-events-none fixed left-0 top-0 z-[100] -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-ink/40 transition-[width,height,border-radius] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=active]:h-20 data-[state=active]:w-20 data-[state=active]:-ml-10 data-[state=active]:-mt-10 data-[state=active]:bg-ink data-[state=active]:text-bone"
        style={{ x: ringX, y: ringY }}
      >
        <span
          ref={labelRef}
          className="text-[10px] uppercase tracking-[0.18em] opacity-0 transition-opacity duration-200 [[data-state=active]_&]:opacity-100"
        />
      </motion.div>
    </>
  );
}
