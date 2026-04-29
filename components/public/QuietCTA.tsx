'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MagneticLink } from '@/components/motion/MagneticButton';

/**
 * Quiet CTA — full-bleed dark with multi-layer animated colour blobs.
 * Visually high-impact closing section before the footer.
 */
export function QuietCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-bone">
      {/* Animated colour washes */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 h-[80vmax] w-[80vmax] rounded-full opacity-30 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)', filter: 'blur(140px)' }}
        animate={{ x: ['0%', '8%', '-4%', '0%'], y: ['0%', '4%', '-6%', '0%'], scale: [1, 1.05, 0.96, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[80vmax] w-[80vmax] rounded-full opacity-30 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--sunset) 0%, transparent 60%)', filter: 'blur(140px)' }}
        animate={{ x: ['0%', '-6%', '4%', '0%'], y: ['0%', '-8%', '4%', '0%'], scale: [1, 0.95, 1.08, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/3 top-1/3 h-[55vmax] w-[55vmax] rounded-full opacity-30 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--gulf) 0%, transparent 50%)', filter: 'blur(140px)' }}
        animate={{ x: ['0%', '12%', '-8%', '0%'], y: ['0%', '-4%', '8%', '0%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle film-grain noise to kill banding */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="container-editorial relative z-10 flex flex-col items-baseline gap-12 py-32 md:flex-row md:items-end md:justify-between md:py-44">
        <div className="max-w-[28ch]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] uppercase tracking-[0.28em] text-bone/60"
          >
            Looking for something specific?
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-5xl leading-[1.05] tracking-editorial md:text-8xl"
          >
            Tell us. We&apos;ll{' '}
            <span className="italic text-gold">find it</span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 max-w-[40ch] text-base leading-[1.6] text-bone/75"
          >
            Send us your brief — bedrooms, area, budget — and we&apos;ll come back with a curated shortlist within the day.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="flex flex-col items-start gap-4 sm:flex-row md:flex-col md:items-end lg:flex-row lg:items-center"
        >
          <MagneticLink
            href="/contact"
            cursor="get in touch"
            className="group inline-flex items-center gap-4 bg-bone px-7 py-4 text-ink transition-colors hover:bg-gold hover:text-ink"
          >
            <span className="text-[11px] uppercase tracking-[0.28em]">Send your brief</span>
            <span className="block h-px w-12 bg-ink transition-all duration-500 group-hover:w-20" />
          </MagneticLink>
          <Link
            href="tel:+971581005220"
            data-cursor="call"
            className="group inline-flex items-center gap-3 border border-bone/30 px-7 py-4 transition-colors hover:border-gold"
          >
            <span className="text-[11px] uppercase tracking-[0.28em]">+971 58 100 5220</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
