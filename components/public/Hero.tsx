'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { SplitText } from '@/components/motion/SplitText';
import { RotatingWord } from '@/components/motion/RotatingWord';
import { MagneticLink } from '@/components/motion/MagneticButton';
import { HeroBackground } from '@/components/motion/HeroBackground';

// Loaded lazily, client-only. The parent always renders a static <img> behind
// this canvas, so no `loading` fallback is needed — until the WebGL texture
// finishes loading the static image is visible underneath the (transparent)
// canvas.
const HeroCanvas = dynamic(() => import('@/components/motion/HeroCanvas').then((m) => m.HeroCanvas), {
  ssr: false,
});

const HERO_IMAGE = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80';

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-ivory">
      {/* Layer 0 — animated colour blobs (CSS, GPU-light).
          Replaces the WebGL gradient mesh: a single WebGL context for the
          hero image card was running fine, but stacking a second full-screen
          context underneath caused the GPU compositor to thrash, dropping
          frames and turning the image canvas black after ~1s. */}
      <HeroBackground className="absolute inset-0" />

      <div className="container-editorial relative z-10 grid min-h-[100svh] grid-cols-1 items-center gap-12 pb-24 pt-32 lg:grid-cols-12 lg:gap-16 lg:pt-36">
        {/* Left — copy column */}
        <div className="order-2 flex flex-col lg:order-1 lg:col-span-7">
          {/* Pulsing pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <Link
              href="/areas/al-saadiyat-island"
              data-cursor="explore"
              className="group inline-flex items-center gap-3 rounded-full border border-gold/40 bg-bone/60 px-4 py-2 backdrop-blur-sm transition-colors hover:border-gold hover:bg-bone/80"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-ink">
                Now selling on Saadiyat
              </span>
              <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          {/* Big headline */}
          <h1 className="mt-10 font-display tracking-editorial text-[clamp(2.6rem,7.4vw,7rem)] leading-[0.95] text-ink">
            <SplitText as="span" className="block" stagger={0.022} delay={0.15}>
              Property in Abu Dhabi,
            </SplitText>
            <span className="mt-2 block">
              <RotatingWord
                words={['told', 'sold', 'leased', 'shown']}
                intervalMs={2400}
                className="font-display italic text-gold"
              />
              <SplitText as="span" className="ml-3 inline-block" stagger={0.024} delay={0.55}>
                properly.
              </SplitText>
            </span>
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 1.1 }}
            className="mt-8 max-w-[52ch] text-base leading-[1.6] text-ink/75 md:text-lg"
          >
            A small Abu Dhabi brokerage. Sales, leasing, and broker collaborations across Saadiyat, Reem, Yas, Hudayriyat, and the Corniche. We answer the phone.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 1.25 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <MagneticLink
              href="/listings"
              cursor="browse"
              className="group inline-flex items-center justify-between gap-6 bg-ink px-6 py-4 text-bone transition-colors hover:bg-gulf"
            >
              <span className="text-[11px] uppercase tracking-[0.28em]">Browse listings</span>
              <span className="block h-px w-10 bg-bone transition-all duration-500 ease-editorial group-hover:w-16" />
            </MagneticLink>
            <MagneticLink
              href="/contact"
              cursor="call"
              className="group inline-flex items-center justify-between gap-6 border border-ink/20 px-6 py-4 transition-colors hover:border-ink hover:bg-ink/5"
            >
              <span className="text-[11px] uppercase tracking-[0.28em]">Talk to a broker</span>
              <span className="block h-px w-10 bg-ink transition-all duration-500 ease-editorial group-hover:w-16" />
            </MagneticLink>
          </motion.div>

          {/* Micro stats inline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6"
          >
            <Stat label="Areas covered" value="6" />
            <Stat label="On the books" value="50+" />
            <Stat label="Years in AD" value="15+" />
          </motion.div>
        </div>

        {/* Right — image card */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-ink shadow-[0_30px_80px_-20px_rgba(14,17,22,0.35)]">
              {/* Static image as the always-visible base.
                  - Shown immediately while the HeroCanvas JS bundle loads
                  - Shown while the WebGL texture is suspending (canvas is alpha:true → transparent)
                  - Shown if WebGL fails entirely (graceful fallback)
                  Once the WebGL canvas has texture + shader running, it draws fully-opaque
                  RGB on top, hiding this base image — so we don't double-render anything. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                data-placeholder="true"
              />
              <HeroCanvas src={HERO_IMAGE} className="absolute inset-0" />
              {/* Subtle gold edge at bottom */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/50 to-transparent" />
              {/* Caption block on the image */}
              <div className="absolute inset-x-6 bottom-6 z-10 text-bone">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-80">
                  Featured · Saadiyat
                </p>
                <p className="mt-1 font-display text-2xl tracking-editorial">
                  A four-bedroom on the lagoon.
                </p>
                <Link
                  href="/listings"
                  data-cursor="see"
                  className="group mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
                >
                  See properties
                  <span className="block h-px w-8 bg-bone transition-all duration-500 group-hover:w-14" />
                </Link>
              </div>
            </div>

            {/* Floating reference card */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-sm border border-line bg-bone/95 px-4 py-3 shadow-lg backdrop-blur md:block"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">RERA-licensed</p>
              <p className="mt-1 text-sm">Abu Dhabi · UAE</p>
            </motion.div>

            {/* Floating gold stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ duration: 1, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-3 -top-3 rounded-full bg-gold px-4 py-2 text-bone shadow-lg"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em]">Est. 2010</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-ink/50">Scroll</span>
          <span className="block h-12 w-px bg-ink/30" />
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="tnum font-display text-3xl leading-none tracking-editorial">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">{label}</p>
    </div>
  );
}
