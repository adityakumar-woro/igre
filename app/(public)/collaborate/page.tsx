import type { Metadata } from 'next';
import { ContactForm } from '@/components/public/ContactForm';

export const metadata: Metadata = {
  title: 'Broker Collaborations',
  description: 'Co-broking with agencies across the UAE. Fair splits, fast paperwork.',
};

export default function CollaboratePage() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial mb-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Broker Collaborations</p>
        <h1 className="mt-4 max-w-[20ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
          You bring the buyer. We bring the building.
        </h1>
        <p className="mt-10 max-w-[60ch] text-base leading-[1.7] text-ink/80 md:text-lg">
          We co-broke with agencies across the UAE on Abu Dhabi properties. The terms are simple: fair splits, fast paperwork, listings stay listed where they were. If your buyer wants Saadiyat, Reem, Yas, Hudayriyat, or the Corniche — we can almost certainly help.
        </p>
      </div>

      <div className="container-editorial grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-20">
        <aside className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">How it works</p>
          <ol className="mt-8 space-y-8">
            {[
              ['01.', 'Send us your buyer brief.'],
              ['02.', 'We match it to inventory we know first-hand.'],
              ['03.', 'We arrange viewings — joint or solo, whichever suits.'],
              ['04.', 'On close, we split per the standard MOU.'],
            ].map(([n, t]) => (
              <li key={n}>
                <p className="font-mono text-xs text-mute">{n}</p>
                <p className="mt-2 font-display text-xl tracking-editorial md:text-2xl">{t}</p>
              </li>
            ))}
          </ol>
        </aside>

        <div className="md:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
