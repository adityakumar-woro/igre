'use client';

import { motion } from 'framer-motion';

export interface TeamMember {
  id: string;
  name: string;
  bio: string | null;
  phone: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

/**
 * Compact team grid:
 *   - 4-up on desktop, 2-up on tablet, 1-up on mobile
 *   - Original colour photos (no greyscale)
 *   - Only name, email, phone (no role / bio subheadings)
 *   - Subtle hover lift + photo zoom
 */
export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <section className="bg-bone">
      <div className="container-editorial py-24 md:py-32">
        <div className="mb-12 flex items-baseline justify-between">
          <h2 className="font-display text-4xl leading-[1.05] tracking-editorial md:text-6xl">
            The team.
          </h2>
          <p className="hidden text-[11px] uppercase tracking-[0.28em] text-mute md:block">
            Direct phone · Direct email
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {team.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-gulf shadow-[0_24px_50px_-30px_rgba(14,17,22,0.4)]">
                {m.avatarUrl ? (
                  <>
                    {/* Original colour photograph (no greyscale filter) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                    {/* Subtle gradient at bottom for legibility of any badge if added later */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/30 to-transparent" />
                  </>
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-bone/90"
                    data-placeholder="true"
                  >
                    <span className="font-display text-[8rem] leading-none tracking-editorial">
                      {initials(m.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <h3 className="font-display text-xl leading-[1.15] tracking-editorial">
                  {m.name}
                </h3>
                <div className="mt-3 space-y-1 text-sm">
                  {m.phone && (
                    <a
                      href={`tel:${m.phone.replace(/\s/g, '')}`}
                      className="block text-ink hover:text-gold"
                      data-cursor="call"
                    >
                      {m.phone}
                    </a>
                  )}
                  <a
                    href={`mailto:${m.email}`}
                    className="block break-all text-mute hover:text-gold"
                    data-cursor="email"
                  >
                    {m.email}
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
