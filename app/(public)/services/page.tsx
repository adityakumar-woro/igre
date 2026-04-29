import type { Metadata } from 'next';
import Link from 'next/link';
import { QuietCTA } from '@/components/public/QuietCTA';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Sales, leasing, broker collaborations, valuations.',
};

const SERVICES = [
  {
    n: '01',
    title: 'Sales',
    body:
      'Primary and secondary, freehold and investor-grade. We sell what we know — Saadiyat, Reem, Yas, Hudayriyat, Corniche. We will not list a unit we have not walked through.',
    href: '/listings?listingType=SALE',
    cta: 'See properties for sale',
  },
  {
    n: '02',
    title: 'Rentals',
    body:
      'Annual leases, short-term, furnished and unfurnished. We work with serious tenants and we represent landlords directly. No middlemen, no markup games.',
    href: '/listings?listingType=RENT',
    cta: 'See properties for rent',
  },
  {
    n: '03',
    title: 'Long-term Leasing',
    body:
      'Multi-year residential leases for families and corporate clients. We negotiate the lease, the chiller account, the maintenance terms, and the exit clauses — all of it.',
    href: '/contact',
    cta: 'Talk to us',
  },
  {
    n: '04',
    title: 'Broker Collaborations',
    body:
      'We co-broke with agencies across the UAE. Fair splits, fast paperwork, no listings poached. If you have a buyer for Abu Dhabi, we have the building.',
    href: '/collaborate',
    cta: 'Partner with us',
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial mb-24 md:mb-32">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Services</p>
        <h1 className="mt-4 max-w-[18ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
          Four things we do.<br />We do them well.
        </h1>
      </div>

      <div className="container-editorial space-y-0 border-t border-line">
        {SERVICES.map((s) => (
          <article key={s.n} className="grid grid-cols-1 gap-8 border-b border-line py-16 md:grid-cols-12 md:gap-16 md:py-24">
            <div className="md:col-span-3">
              <p className="font-mono text-[11px] tracking-wider text-mute">{s.n}.</p>
              <h2 className="mt-3 font-display text-3xl tracking-editorial md:text-5xl">{s.title}</h2>
            </div>
            <div className="md:col-span-7 md:col-start-5">
              <p className="text-base leading-[1.7] text-ink/85 md:text-lg">{s.body}</p>
              <Link
                href={s.href}
                data-cursor="open"
                className="group mt-8 inline-flex items-baseline gap-3 text-[11px] uppercase tracking-[0.28em]"
              >
                <span>{s.cta}</span>
                <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <QuietCTA />
    </div>
  );
}
