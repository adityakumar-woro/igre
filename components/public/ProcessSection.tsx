'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface Step {
  n: string;
  title: string;
  body: string;
  tone: 'gold' | 'sunset' | 'sage' | 'gulf';
  bg: string;
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Brief',
    body:
      "A 20-minute conversation. What you want, what you don't, what you'd trade off. Honest answers go faster.",
    tone: 'gold',
    bg: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80',
  },
  {
    n: '02',
    title: 'Shortlist',
    body:
      "We send 4–6 properties we've walked. Not 40. Each comes with what we'd flag and what we wouldn't.",
    tone: 'sunset',
    bg: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&q=80',
  },
  {
    n: '03',
    title: 'Viewings',
    body:
      'On your schedule. We meet you at the building, walk it together, take notes, send them after.',
    tone: 'sage',
    bg: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  },
  {
    n: '04',
    title: 'Close',
    body:
      'Negotiation, paperwork, transfer at the Land Department. We sit in the room with you for the signature.',
    tone: 'gulf',
    bg: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
  },
];

const TONE_TEXT: Record<Step['tone'], string> = {
  gold:   'text-gold',
  sunset: 'text-sunset',
  sage:   'text-sage',
  gulf:   'text-bone',
};

const TONE_BAR: Record<Step['tone'], string> = {
  gold:   'bg-gold',
  sunset: 'bg-sunset',
  sage:   'bg-sage',
  gulf:   'bg-bone',
};

export function ProcessSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const lineWidth = useTransform(scrollYProgress, [0, 0.6], ['0%', '100%']);

  return (
    <section ref={ref} className="bg-ink text-bone">
      <div className="container-editorial py-32 md:py-44">
        <div className="mb-20 flex flex-col items-baseline gap-6 md:flex-row md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-bone/50">How we work</p>
            <h2 className="mt-4 max-w-[16ch] font-display text-4xl leading-[1.05] tracking-editorial md:text-7xl">
              Four steps. No surprises.
            </h2>
          </div>
          <p className="max-w-[40ch] text-sm text-bone/70">
            Buying or renting in Abu Dhabi shouldn&apos;t feel like work. Here&apos;s exactly how we&apos;ll spend your time, in order.
          </p>
        </div>

        {/* Animated progress line tied to scroll */}
        <div className="relative mb-16 h-px bg-bone/10">
          <motion.div className="absolute inset-y-0 left-0 bg-gold" style={{ width: lineWidth }} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.article
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.bg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-110"
                data-placeholder="true"
                loading="lazy"
              />
              {/* Strong dark veil so type stays editorial */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-8">
                <p className={`font-display text-[5.5rem] leading-[0.85] tracking-editorial md:text-[7rem] ${TONE_TEXT[s.tone]}`}>
                  {s.n}
                </p>
                <div>
                  <h3 className="font-display text-3xl tracking-editorial">{s.title}</h3>
                  <p className="mt-4 max-w-[34ch] text-sm leading-[1.6] text-bone/80">{s.body}</p>
                  <div className={`mt-6 h-px w-12 ${TONE_BAR[s.tone]} transition-all duration-500 group-hover:w-24`} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
