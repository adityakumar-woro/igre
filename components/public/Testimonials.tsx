'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Quote {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  bg: string;
  accent: 'gold' | 'sunset' | 'gulf' | 'sage';
}

const QUOTES: Quote[] = [
  {
    quote:
      'They told us a tower we were keen on had a chiller-system problem the developer was hiding. Saved us a year of headaches. Now we\'re only buying through Kaiser.',
    author: 'Sarah A.',
    role: 'Bought a 3BR on Saadiyat',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bg: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1400&q=80',
    accent: 'gold',
  },
  {
    quote:
      'Most agents take a week to call back. IGRE called back the same morning, and the broker showed up to the viewing with a measuring tape and a printed floorplan.',
    author: 'Henrik O.',
    role: 'Co-broking partner, Dubai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    bg: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1400&q=80',
    accent: 'sunset',
  },
  {
    quote:
      'We rented a 2BR on Reem through them. Easy, quick, no nonsense. Renewal a year later: one phone call, signed in twenty minutes.',
    author: 'Priya I.',
    role: 'Tenant on Al Reem Island',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    bg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
    accent: 'gulf',
  },
  {
    quote:
      'Asad walked us through five villas on Yas Acres in one afternoon. We bought the third one. Two years on, his number is still saved as "the property guy".',
    author: 'Khalifa M.',
    role: 'Bought a villa on Yas Acres',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80',
    accent: 'sage',
  },
];

const ACCENT_TEXT: Record<Quote['accent'], string> = {
  gold:   'text-gold',   sunset: 'text-sunset',  gulf: 'text-gulf',  sage: 'text-sage',
};
const ACCENT_DOT: Record<Quote['accent'], string> = {
  gold: 'bg-gold', sunset: 'bg-sunset', gulf: 'bg-gulf', sage: 'bg-sage',
};

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[index];

  return (
    <section className="relative isolate overflow-hidden bg-ivory">
      {/* Decorative drifting blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 top-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-30 mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)', filter: 'blur(120px)' }}
      />

      <div className="container-editorial relative z-10 py-32 md:py-44">
        <div className="mb-16 flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">What clients say</p>
          <div className="flex items-center gap-3">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Quote ${i + 1}`}
                className={`h-1.5 transition-all duration-500 ${
                  i === index ? 'w-10 bg-ink' : 'w-1.5 bg-ink/20 hover:bg-ink/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Image card with author + property backdrop */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`bg-${index}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-[0_30px_80px_-30px_rgba(14,17,22,0.45)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.bg} alt="" className="absolute inset-0 h-full w-full object-cover" data-placeholder="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

                {/* Floating author chip */}
                <div className="absolute right-6 top-6 flex items-center gap-3 rounded-full bg-bone/90 py-1 pl-1 pr-4 backdrop-blur-md">
                  <span className="block h-12 w-12 overflow-hidden rounded-full bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={q.avatar} alt={q.author} className="h-full w-full object-cover" data-placeholder="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-ink">{q.author}</span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-mute">verified</span>
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-7 text-bone md:p-8">
                  <div className="flex items-center gap-3">
                    <span className={`block h-2 w-2 rounded-full ${ACCENT_DOT[q.accent]}`} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70">
                      {q.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Quote */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={`q-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`block font-display leading-[0.7] ${ACCENT_TEXT[q.accent]} text-[10rem] md:text-[14rem]`}>
                  &ldquo;
                </span>
                <blockquote className="-mt-4 font-display text-2xl leading-[1.2] tracking-editorial text-ink md:text-4xl">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-10 flex items-baseline gap-4 border-t border-line pt-6">
                  <span className="text-base text-ink">— {q.author}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-mute">{q.role}</span>
                </figcaption>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
