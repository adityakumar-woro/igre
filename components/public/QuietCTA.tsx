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
    <section className="bg-bone">
      <div className="container-editorial py-24 md:py-32">
        <div className="relative isolate overflow-hidden rounded-sm bg-ink text-bone shadow-[0_34px_100px_-60px_rgba(14,17,22,0.7)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.pixabay.com/photo/2021/08/19/12/03/city-6557858_1280.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />

          <div className="relative z-10 grid grid-cols-1 gap-10 p-8 md:grid-cols-12 md:p-12 lg:p-16">
            <div className="md:col-span-7">
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
                className="mt-6 max-w-[13ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl"
              >
                Tell us. We&apos;ll{' '}
                <span className="italic text-gold">find it</span>.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-7 max-w-[44ch] text-base leading-[1.7] text-bone/75"
              >
                Send the brief once: area, bedrooms, budget, and timeline. We will reply with a focused next step instead of a pile of random listings.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="flex flex-col justify-end gap-4 md:col-span-5 md:items-end"
            >
              <MagneticLink
                href="/contact"
                cursor="get in touch"
                className="group inline-flex w-full items-center justify-between gap-4 bg-bone px-7 py-4 text-ink transition-colors hover:bg-gold hover:text-ink md:w-auto"
              >
                <span className="text-[11px] uppercase tracking-[0.28em]">Send your brief</span>
                <span className="block h-px w-12 bg-ink transition-all duration-500 group-hover:w-20" />
              </MagneticLink>
              <Link
                href="tel:+971525697323"
                data-cursor="call"
                className="group inline-flex w-full items-center justify-center gap-3 border border-bone/30 px-7 py-4 transition-colors hover:border-gold md:w-auto"
              >
                <span className="text-[11px] uppercase tracking-[0.28em]">+971 52 569 7323</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
