'use client';

import { motion } from 'framer-motion';
import { Counter } from '@/components/motion/Counter';

interface KPI {
  label: string;
  value: number;
  suffix?: string;
  tone: 'gold' | 'gulf' | 'sunset' | 'sage';
  highlight?: boolean;
}

/**
 * Dashboard hero — animated colourful header strip.
 *  - Multi-layer drifting colour blobs (CSS only, GPU-light)
 *  - Animated KPI counters
 *  - Greets the agent by name
 *  - Time-of-day tagline
 */
export function DashboardHero({
  name,
  role,
  kpis,
}: {
  name: string;
  role: string;
  kpis: KPI[];
}) {
  const greeting = greetingForNow();

  return (
    <section className="relative isolate -mx-6 -mt-10 overflow-hidden rounded-sm bg-ink text-bone md:-mx-12 md:-mt-14">
      {/* Animated colour blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-[40vmax] w-[40vmax] rounded-full opacity-35 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)', filter: 'blur(100px)' }}
        animate={{ x: ['0%', '6%', '-4%', '0%'], y: ['0%', '4%', '-6%', '0%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 -bottom-1/4 h-[40vmax] w-[40vmax] rounded-full opacity-35 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--sunset) 0%, transparent 60%)', filter: 'blur(100px)' }}
        animate={{ x: ['0%', '-6%', '4%', '0%'], y: ['0%', '-4%', '6%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/3 top-1/4 h-[35vmax] w-[35vmax] rounded-full opacity-30 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--gulf) 0%, transparent 50%)', filter: 'blur(120px)' }}
        animate={{ x: ['0%', '8%', '-4%', '0%'], y: ['0%', '-4%', '6%', '0%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Film grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <span className="block h-2 w-2 animate-pulse rounded-full bg-gold" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/60">
            {greeting} · {role === 'ADMIN' ? 'Admin' : 'Agent'}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-4 font-display text-4xl leading-[1.05] tracking-editorial md:text-6xl"
        >
          Hello, <span className="italic text-gold">{name.split(' ')[0]}</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-3 max-w-[60ch] text-sm text-bone/70"
        >
          Here&apos;s the state of play. Mark something done — or send another shortlist.
        </motion.p>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
          {kpis.map((k, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 + i * 0.07 }}
              className="border-l-2 pl-4"
              style={{ borderColor: TONE_BORDER[k.tone] }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">
                {k.label}
              </p>
              <p
                className="tnum mt-2 font-display text-4xl leading-none tracking-editorial md:text-5xl"
                style={{ color: k.highlight ? TONE_BORDER[k.tone] : 'var(--bone)' }}
              >
                <Counter to={k.value} suffix={k.suffix} />
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TONE_BORDER: Record<KPI['tone'], string> = {
  gold:   'var(--gold)',
  gulf:   'var(--tide)',
  sunset: 'var(--sunset)',
  sage:   'var(--sage)',
};

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
