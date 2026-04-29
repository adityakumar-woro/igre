'use client';

import { motion } from 'framer-motion';
import { Counter } from '@/components/motion/Counter';

interface Stat {
  value: number;
  suffix?: string;
  label: string;
  sub: string;
  tone: 'gold' | 'gulf' | 'sunset' | 'sage';
  bg: string;
}

const STATS: Stat[] = [
  {
    value: 6,
    label: 'Areas covered',
    sub: 'Saadiyat, Reem, Yas, Hudayriyat, Corniche, Yas Bay.',
    tone: 'gold',
    bg: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
  },
  {
    value: 50,
    suffix: '+',
    label: 'On the books',
    sub: 'Active sale and rental listings, refreshed every week.',
    tone: 'gulf',
    bg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  },
  {
    value: 15,
    suffix: '+',
    label: 'Years in Abu Dhabi',
    sub: 'Local since day one. Brokers, not visitors.',
    tone: 'sunset',
    bg: 'https://images.unsplash.com/photo-1583425423320-eb8617c01da2?w=1200&q=80',
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Reachable',
    sub: 'Direct phone, direct email. No call centre, no chatbot.',
    tone: 'sage',
    bg: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80',
  },
];

const TONE: Record<Stat['tone'], { gradient: string; dot: string }> = {
  gold:    { gradient: 'from-gold/95 via-gold/40 to-transparent',     dot: 'bg-gold' },
  gulf:    { gradient: 'from-gulf/95 via-gulf/40 to-transparent',     dot: 'bg-gulf' },
  sunset:  { gradient: 'from-sunset/95 via-sunset/40 to-transparent', dot: 'bg-sunset' },
  sage:    { gradient: 'from-sage/95 via-sage/40 to-transparent',     dot: 'bg-sage' },
};

export function StatsBlock() {
  return (
    <section className="relative isolate overflow-hidden bg-bone">
      {/* Soft drifting blobs in background — purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[40vmax] w-[40vmax] rounded-full opacity-40 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)', filter: 'blur(80px)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 -bottom-1/4 h-[40vmax] w-[40vmax] rounded-full opacity-40 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--gulf) 0%, transparent 60%)', filter: 'blur(100px)' }}
      />

      <div className="container-editorial relative z-10 py-24 md:py-36">
        <div className="mb-16 flex flex-col items-baseline justify-between gap-6 md:flex-row md:gap-12">
          <h2 className="max-w-[20ch] font-display text-4xl leading-[1.05] tracking-editorial md:text-6xl">
            A small brokerage. Big presence on the islands.
          </h2>
          <p className="max-w-[36ch] text-sm text-mute md:text-base">
            We do one thing — Abu Dhabi residential. We do it carefully, locally, and have for a while.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STATS.map((s, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm shadow-[0_24px_60px_-30px_rgba(14,17,22,0.4)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.bg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-110"
                data-placeholder="true"
                loading="lazy"
              />
              {/* Coloured tint over image */}
              <div className={`absolute inset-0 bg-gradient-to-t ${TONE[s.tone].gradient} mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-bone md:p-7">
                <div className="flex items-center gap-2">
                  <span className={`block h-2 w-2 rounded-full ${TONE[s.tone].dot}`} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <div>
                  <p className="font-display text-[5.5rem] leading-[0.85] tracking-editorial md:text-[6.5rem]">
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-bone">
                    {s.label}
                  </p>
                  <p className="mt-2 max-w-[28ch] text-xs leading-[1.5] text-bone/75">
                    {s.sub}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
