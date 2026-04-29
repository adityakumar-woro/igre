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
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Contact</p>
        <h1 className="mt-4 max-w-[16ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-8xl">
          Talk to a broker. We answer the phone.
        </h1>
      </div>

      <div className="container-editorial mt-24 grid grid-cols-1 gap-20 md:grid-cols-12">
        <aside className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Office</p>
          <p className="mt-4 max-w-[28ch] font-display text-3xl leading-[1.2] tracking-editorial">
            Building C3, Office M3<br />Abu Dhabi, UAE
          </p>
          <a
            href="https://maps.app.goo.gl/DMp1ykHUzmtbbG4u9"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm hover:text-gold"
            data-cursor="open map"
          >
            View on Google Maps ↗
          </a>

          <div className="mt-12 space-y-2 text-base">
            <p>
              <a href="tel:+971581005220" className="hover:text-gold" data-cursor="call">
                +971 58 100 5220
              </a>
            </p>
            <p>
              <a href="mailto:igre.kaiser@gmail.com" className="hover:text-gold" data-cursor="email">
                igre.kaiser@gmail.com
              </a>
            </p>
            <p>
              <a
                href="https://wa.me/971581005220"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
                data-cursor="whatsapp"
              >
                WhatsApp ↗
              </a>
            </p>
          </div>

          <div className="mt-16 aspect-[4/3] w-full overflow-hidden bg-sand">
            <iframe
              title="IGRE office on Google Maps"
              src="https://www.google.com/maps?q=Abu+Dhabi+UAE&output=embed"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>

        <div className="md:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
