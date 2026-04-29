'use client';

import { motion } from 'framer-motion';

/**
 * Animated gradient background for the hero — CSS-only, GPU-light.
 *
 * Replaces the WebGL gradient mesh: three large radial-gradient blobs (gold,
 * sunset, gulf) drift slowly via Framer Motion translate animations, blurred
 * into a single soft surface. Plus a faint SVG noise overlay to kill banding.
 *
 * Costs almost nothing on the GPU — just a few transformed blurred divs —
 * which lets the foreground HeroCanvas (the WebGL image-card) keep its
 * compositor layer warm and stop going black.
 */
export function HeroBackground({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className ?? ''}`} aria-hidden>
      {/* Base */}
      <div className="absolute inset-0 bg-ivory" />

      {/* Three drifting colour blobs.
          They're sized larger than the viewport and translate within a small
          range — plus a slow scale breathe — so the surface always feels alive
          without ever looking gimmicky. blur(120px) gives the soft falloff. */}
      <motion.div
        aria-hidden
        className="absolute -top-1/4 -left-1/4 h-[80vmax] w-[80vmax] rounded-full opacity-70 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: ['0%', '8%', '-4%', '0%'],
          y: ['0%', '6%', '12%', '0%'],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden
        className="absolute -bottom-1/4 -right-1/4 h-[80vmax] w-[80vmax] rounded-full opacity-70 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle at center, var(--sunset) 0%, transparent 55%)',
          filter: 'blur(90px)',
        }}
        animate={{
          x: ['0%', '-6%', '4%', '0%'],
          y: ['0%', '-8%', '6%', '0%'],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden
        className="absolute top-1/4 left-1/3 h-[55vmax] w-[55vmax] rounded-full opacity-60 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle at center, var(--gulf) 0%, transparent 50%)',
          filter: 'blur(100px)',
        }}
        animate={{
          x: ['0%', '12%', '-8%', '0%'],
          y: ['0%', '-4%', '8%', '0%'],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle film-grain SVG noise — masks gradient banding.
          Inline data URI; no extra request, fixed (no animation). */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Faint top fade so the header reads cleanly */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bone/50 to-transparent" />
    </div>
  );
}
