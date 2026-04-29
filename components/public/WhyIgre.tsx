'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Card {
  n: string;
  title: string;
  body: string;
  tone: 'gold' | 'gulf' | 'sunset';
  bg: string;
}

const POINTS: Card[] = [
  {
    n: '01',
    title: 'Local since day one.',
    body:
      "We are based in Abu Dhabi, not visiting from Dubai. We know which towers leak in summer, which buildings have bad lifts, which villas are overpriced. We have the keys, not the brochure.",
    tone: 'gold',
    // Abu Dhabi cityscape — local
    bg: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1400&q=80',
  },
  {
    n: '02',
    title: 'Brokers, not salespeople.',
    body:
      "We will tell you when a property is wrong for you. We will tell you when the timing is bad. We are paid by the deal, but we are not paid to make you make one.",
    tone: 'gulf',
    // Quiet desk / paperwork — careful work
    bg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80',
  },
  {
    n: '03',
    title: 'We answer the phone.',
    body:
      "Four numbers, four humans. No call centre. If we are showing a property, we will call you back the moment we are out of it.",
    tone: 'sunset',
    // Phone with city view — direct contact
    bg: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1400&q=80',
  },
];

const TONE_TINT: Record<Card['tone'], string> = {
  gold:   'from-gold/90 via-gold/30 to-transparent',
  gulf:   'from-gulf/90 via-gulf/30 to-transparent',
  sunset: 'from-sunset/90 via-sunset/30 to-transparent',
};

const TONE_DOT: Record<Card['tone'], string> = {
  gold: 'bg-gold', gulf: 'bg-gulf', sunset: 'bg-sunset',
};

export function WhyIgre() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <section ref={ref} className="bg-sand">
      <div className="container-editorial py-32 md:py-44">
        <div className="mb-20 flex flex-col items-baseline gap-6 md:flex-row md:justify-between">
          <h2 className="max-w-[18ch] font-display text-4xl leading-[1.05] tracking-editorial md:text-7xl">
            Why work with us.
          </h2>
          <p className="max-w-[36ch] text-sm text-ink/70 md:text-base">
            Three things, plainly. Each comes with a story we can tell you in person.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {POINTS.map((p, i) => (
            <motion.article
              key={p.n}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm shadow-[0_30px_60px_-30px_rgba(14,17,22,0.45)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.bg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-105"
                data-placeholder="true"
                loading="lazy"
              />
              {/* Coloured tint */}
              <div className={`absolute inset-0 bg-gradient-to-t ${TONE_TINT[p.tone]} mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/10" />

              <div className="absolute inset-0 flex flex-col justify-between p-7 text-bone md:p-9">
                <div className="flex items-center gap-3">
                  <span className={`block h-2 w-2 rounded-full ${TONE_DOT[p.tone]}`} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/70">
                    {p.n}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-3xl leading-[1.1] tracking-editorial md:text-4xl">
                    {p.title}
                  </h3>
                  <p className="mt-5 max-w-[40ch] text-sm leading-[1.65] text-bone/85">{p.body}</p>
                </div>
              </div>

              {/* Decorative number watermark */}
              <span className="pointer-events-none absolute -bottom-6 -right-2 font-display text-[10rem] leading-none tracking-editorial text-bone/10 md:text-[14rem]">
                {p.n}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
