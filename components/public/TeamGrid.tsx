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

const HIDE_EMAILS = new Set(['admin@igre.ae']);

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
  const fallbackImage = '/team/mary-angel.svg';

  return (
    <section className="bg-bone">
      <div className="container-editorial py-14 md:py-28">
        <div className="mb-8 grid grid-cols-1 gap-5 border-b border-line pb-8 md:mb-12 md:grid-cols-12 md:items-end md:pb-10">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">People</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-editorial sm:text-5xl md:text-7xl">
              The team.
            </h2>
          </div>
          <p className="max-w-[42ch] text-sm leading-[1.7] text-mute md:col-span-5">
            Direct contacts for Abu Dhabi sales, rentals, leasing, viewings, and client follow-up.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {team.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              className="group overflow-hidden rounded-sm border border-line bg-bone transition-colors hover:bg-ivory"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gulf">
                {m.avatarUrl ? (
                  <>
                    {/* Original colour photograph (no greyscale filter) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.05]"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/45 to-transparent" />
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

              <div className="min-w-0 p-4 sm:p-5">
                <h3 className="break-words font-display text-2xl leading-[1.05] tracking-editorial">
                  {m.name}
                </h3>
                <div className="mt-4 space-y-1 text-sm">
                  {m.phone && (
                    <a
                      href={`tel:${m.phone.replace(/\s/g, '')}`}
                      className="block text-ink hover:text-gold"
                      data-cursor="call"
                    >
                      {m.phone}
                    </a>
                  )}
                  {m.email && !HIDE_EMAILS.has(m.email) && (
                    <a
                      href={`mailto:${m.email}`}
                      className="block break-all text-mute hover:text-gold"
                      data-cursor="email"
                    >
                      {m.email}
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
