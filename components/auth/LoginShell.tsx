'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Suspense, type ReactNode } from 'react';

// Single WebGL canvas — the gradient mesh is safe here because there's nothing
// else fighting for the GPU on auth pages.
const GradientMesh = dynamic(
  () => import('@/components/motion/GradientMesh').then((m) => m.GradientMesh),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-ivory" /> },
);

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function LoginShell({ eyebrow, title, subtitle, children }: Props) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {/* WebGL animated gradient mesh */}
      <GradientMesh className="absolute inset-0 -z-10" />

      {/* Soft scrim so text reads cleanly on top of the colorful mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-bone/40 backdrop-blur-[2px]" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-12">
        {/* Left rail — brand panel (only on desktop) */}
        <aside className="hidden bg-ink/0 lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            {/* Logo mark */}
            <span className="relative inline-block h-10 w-10 overflow-hidden rounded-full bg-bone shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-2xl tracking-editorial">IGRE</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/60">{eyebrow}</p>
            <h1 className="mt-4 max-w-[18ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-6 max-w-[40ch] text-base text-ink/70">{subtitle}</p>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/40"
          >
            Real Estate · Abu Dhabi · Established 2010
          </motion.p>
        </aside>

        {/* Right — form panel (frosted glass card) */}
        <main className="flex items-center justify-center px-6 py-24 lg:col-span-7 lg:p-12">
          <Suspense fallback={null}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md"
            >
              {/* Mobile brand mark + heading shown above the form */}
              <div className="mb-10 lg:hidden">
                <div className="flex items-center gap-3">
                  <span className="relative inline-block h-9 w-9 overflow-hidden rounded-full bg-bone shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/logo.png" alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="font-display text-xl tracking-editorial">IGRE</span>
                </div>
                <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-mute">{eyebrow}</p>
                <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-editorial">
                  {title}
                </h1>
              </div>

              <div className="rounded-sm border border-line bg-bone/85 p-8 shadow-[0_30px_80px_-30px_rgba(14,17,22,0.35)] backdrop-blur-md md:p-10">
                {children}
              </div>
            </motion.div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
