import type { Metadata } from 'next';
import { ContactForm } from '@/components/public/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Office, phone, email. Talk to a broker — we answer the phone.',
};

export default function ContactPage() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Contact</p>
            <h1 className="mt-4 max-w-[14ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-8xl">
              Tell us what you need next.
            </h1>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-base leading-[1.7] text-ink/70">
              Tell us what you need: area, budget, bedrooms, timing, and whether it is for rent or sale. We will keep the response clear and practical.
            </p>
          </div>
        </div>
      </div>

      <section className="container-editorial mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <aside className="lg:col-span-4">
            <div className="overflow-hidden rounded-sm bg-ink text-bone shadow-[0_30px_90px_-55px_rgba(14,17,22,0.7)]">
              <div className="aspect-[4/5] overflow-hidden bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/team/mary-angel.jpeg"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-7">
                <p className="text-[11px] uppercase tracking-[0.28em] text-bone/45">Response desk</p>
                <p className="mt-4 font-display text-4xl leading-[0.95] tracking-editorial">
                  Viewings, rentals, sales.
                </p>
                <p className="mt-5 text-sm leading-[1.7] text-bone/65">
                  For the fastest answer, call or WhatsApp your requirement and preferred viewing time.
                </p>
                <div className="mt-7 grid gap-3">
                  <a
                    href="tel:+971525697323"
                    className="flex items-center justify-between bg-bone px-5 py-4 text-sm text-ink transition-colors hover:bg-gold hover:text-bone"
                  >
                    <span>Call</span>
                    <span className="tnum">+971 52 569 7323</span>
                  </a>
                  <a
                    href="https://wa.me/971525697323"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between border border-bone/20 px-5 py-4 text-sm transition-colors hover:border-gold hover:text-gold"
                  >
                    <span>WhatsApp</span>
                    <span>Open chat</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="border border-line bg-bone p-7 md:p-10">
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Send enquiry</p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>

          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="border border-line bg-ivory p-7 md:p-10 lg:col-span-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Office</p>
                <h2 className="mt-4 font-display text-3xl leading-[1.05] tracking-editorial md:text-5xl">
                  Building C3, Office M3
                </h2>
                <p className="mt-4 text-sm leading-[1.7] text-ink/70">
                  Abu Dhabi, UAE
                </p>
                <a
                  href="https://maps.app.goo.gl/DMp1ykHUzmtbbG4u9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-block text-sm uppercase tracking-[0.18em] text-mute hover:text-gold"
                >
                  View on Google Maps
                </a>
              </div>

              <div className="h-[360px] overflow-hidden border border-line bg-sand md:h-[430px] lg:col-span-8">
                <iframe
                  title="IGRE office on Google Maps"
                  src="https://www.google.com/maps?q=Building+C3+Office+M3+Abu+Dhabi+UAE&output=embed"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
