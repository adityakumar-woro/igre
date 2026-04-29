import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { FooterMarquee } from './FooterMarquee';

/**
 * World-class footer:
 *   - Big brand statement on top with animated marquee
 *   - 4-column structured nav (Office / Browse / Company / Connect)
 *   - Subtle gradient blob washes (decorative)
 *   - Bottom row: copyright · RERA · made-by
 */
export async function Footer() {
  const settings = await db.siteSetting.findMany().catch(() => []);
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-ink text-bone">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-20 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 60%)', filter: 'blur(140px)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 -bottom-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-20 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at center, var(--gulf) 0%, transparent 60%)', filter: 'blur(140px)' }}
      />

      {/* Top marquee strip */}
      <div className="relative z-10 border-b border-bone/10">
        <FooterMarquee
          items={[
            'Saadiyat Island', 'Al Reem Island', 'Yas Island', 'Hudayriyat Island',
            'Abu Dhabi Corniche', 'Yas Bay', 'Ferrari World district',
          ]}
        />
      </div>

      {/* Main grid */}
      <div className="container-editorial relative z-10 grid grid-cols-1 gap-16 py-24 md:grid-cols-12 md:gap-12 md:py-32">
        {/* Brand statement (5 cols) */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="relative inline-block h-12 w-12 overflow-hidden rounded-full bg-bone shadow-md">
              <Image
                src="/brand/logo.png"
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </span>
            <span className="font-display text-2xl tracking-editorial">IGRE</span>
          </div>

          <p className="mt-10 max-w-[20ch] font-display text-4xl leading-[0.95] tracking-editorial md:text-6xl">
            Property in Abu&nbsp;Dhabi,{' '}
            <span className="italic text-gold">told properly</span>.
          </p>

          <p className="mt-8 max-w-[44ch] text-sm leading-[1.6] text-bone/70">
            A small Abu Dhabi brokerage. Sales, leasing, and broker collaborations across Saadiyat,
            Reem, Yas, Hudayriyat, and the Corniche. Local since day one.
          </p>
        </div>

        {/* Office (3 cols) */}
        <div className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/40">
            Office
          </p>
          <p className="mt-6 text-base leading-[1.6] text-bone">
            {map.company_address ?? 'Building C3, Office M3, Abu Dhabi, UAE'}
          </p>
          <a
            href={map.company_map_url ?? 'https://maps.app.goo.gl/DMp1ykHUzmtbbG4u9'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs uppercase tracking-[0.18em] text-gold hover:text-bone"
            data-cursor="open map"
          >
            View on map ↗
          </a>

          <ul className="mt-8 space-y-2 text-base">
            <li>
              <a
                href={`tel:${map.company_phone ?? '+971581005220'}`}
                className="text-bone hover:text-gold"
                data-cursor="call"
              >
                {map.company_phone ?? '+971 58 100 5220'}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${map.company_email ?? 'igre.kaiser@gmail.com'}`}
                className="text-bone/80 hover:text-gold"
                data-cursor="email"
              >
                {map.company_email ?? 'igre.kaiser@gmail.com'}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${map.whatsapp_number ?? '971581005220'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bone/80 hover:text-gold"
                data-cursor="whatsapp"
              >
                WhatsApp ↗
              </a>
            </li>
          </ul>
        </div>

        {/* Browse + Company columns share 4 cols */}
        <div className="grid grid-cols-2 gap-8 md:col-span-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/40">Browse</p>
            <ul className="mt-6 space-y-3 text-base">
              <li><Link href="/listings" className="text-bone/80 hover:text-gold">All listings</Link></li>
              <li><Link href="/areas" className="text-bone/80 hover:text-gold">Areas</Link></li>
              <li><Link href="/services" className="text-bone/80 hover:text-gold">Services</Link></li>
              <li><Link href="/collaborate" className="text-bone/80 hover:text-gold">Collaborations</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/40">Company</p>
            <ul className="mt-6 space-y-3 text-base">
              <li><Link href="/about" className="text-bone/80 hover:text-gold">About</Link></li>
              <li><Link href="/team" className="text-bone/80 hover:text-gold">Team</Link></li>
              <li><Link href="/contact" className="text-bone/80 hover:text-gold">Contact</Link></li>
              <li><Link href="/login" className="text-bone/80 hover:text-gold">Sign in</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-bone/10">
        <div className="container-editorial flex flex-col gap-4 py-8 text-xs text-bone/50 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{map.footer_copyright ?? `© ${year} IGRE Real Estate Brokers. All rights reserved.`}</span>
            <span className="font-mono uppercase tracking-[0.18em]">
              RERA · {map.rera_license ?? 'TODO'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={map.instagram_url ?? '#'} className="hover:text-gold">Instagram</a>
            <a href={map.linkedin_url ?? '#'} className="hover:text-gold">LinkedIn</a>
            <span className="hidden text-bone/30 md:inline">·</span>
            <span className="text-bone/60">
              Made by{' '}
              <a
                href="https://woro.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold transition-colors hover:text-bone"
              >
                Woro Tech Team
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
