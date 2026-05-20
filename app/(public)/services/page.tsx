import type { Metadata } from 'next';
import Link from 'next/link';
import { QuietCTA } from '@/components/public/QuietCTA';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Sales, rentals, leasing, broker collaborations, and Abu Dhabi property support.',
};

const SERVICES = [
  {
    n: '01',
    title: 'Sales',
    body:
      'Primary and secondary homes across Abu Dhabi. We check the property, understand the building, and explain the real trade-offs before you commit.',
    href: '/listings?listingType=SALE',
    cta: 'See properties for sale',
    image: 'https://images.pexels.com/photos/21856196/pexels-photo-21856196.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    n: '02',
    title: 'Rentals',
    body:
      'Apartments, villas, townhouses, furnished and unfurnished. We help tenants shortlist quickly and help landlords keep enquiries serious.',
    href: '/listings?listingType=RENT',
    cta: 'See properties for rent',
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    n: '03',
    title: 'Long-term leasing',
    body:
      'Multi-year residential leases for families and corporate clients, including maintenance terms, chiller accounts, renewal clauses, and handover details.',
    href: '/contact',
    cta: 'Discuss a lease',
    image: 'https://cdn.pixabay.com/photo/2021/08/19/12/03/city-6557858_1280.jpg',
  },
  {
    n: '04',
    title: 'Broker collaborations',
    body:
      'Fair co-broking for UAE agencies with Abu Dhabi buyers or tenants. Clear terms, fast paperwork, and no listing games.',
    href: '/collaborate',
    cta: 'Partner with us',
    image: 'https://cdn.pixabay.com/photo/2020/06/02/06/30/abu-dhabi-5249641_1280.jpg',
  },
];

export default function ServicesPage() {
  const [lead, ...rest] = SERVICES;

  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial">
        <div className="grid grid-cols-1 gap-10 border-b border-line pb-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Services</p>
            <h1 className="mt-4 max-w-[14ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-8xl">
              What IGRE handles.
            </h1>
          </div>
          <p className="max-w-[44ch] text-base leading-[1.7] text-ink/70 md:col-span-5">
            Sales, rentals, leasing, and broker partnerships across Abu Dhabi, handled with local knowledge and direct communication.
          </p>
        </div>
      </div>

      <section className="container-editorial mt-12">
        <Link href={lead.href} className="group grid grid-cols-1 overflow-hidden rounded-sm bg-ink text-bone shadow-[0_34px_100px_-60px_rgba(14,17,22,0.65)] lg:grid-cols-12">
          <div className="relative min-h-[440px] lg:col-span-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lead.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          </div>
          <div className="flex flex-col justify-between p-8 md:p-10 lg:col-span-5 lg:p-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/50">{lead.n}</p>
              <h2 className="mt-5 font-display text-5xl leading-[0.95] tracking-editorial md:text-7xl">{lead.title}</h2>
              <p className="mt-6 max-w-[38ch] text-sm leading-[1.7] text-bone/70">{lead.body}</p>
            </div>
            <span className="mt-10 inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-gold">
              {lead.cta}
              <span className="h-px w-12 bg-gold transition-all duration-500 group-hover:w-20" />
            </span>
          </div>
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {rest.map((service) => (
            <Link key={service.n} href={service.href} className="group overflow-hidden rounded-sm border border-line bg-bone transition-colors hover:bg-ivory">
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={service.image} alt="" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">{service.n}</p>
                <h2 className="mt-4 font-display text-3xl leading-[1] tracking-editorial">{service.title}</h2>
                <p className="mt-5 text-sm leading-[1.7] text-ink/70">{service.body}</p>
                <span className="mt-7 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-mute group-hover:text-ink">
                  {service.cta}
                  <span className="h-px w-8 bg-ink transition-all duration-500 group-hover:w-14" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <QuietCTA />
    </div>
  );
}
