import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { TeamGrid } from '@/components/public/TeamGrid';
import { QuietCTA } from '@/components/public/QuietCTA';

export const metadata: Metadata = {
  title: 'About',
  description: 'A small Abu Dhabi brokerage. Local since day one.',
};

// Hits SQLite at render time — DB only exists at runtime.
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const team = await db.user.findMany({
    where: {
      email: {
        in: [
          'igre.asad@gmail.com',
          'faisalvpz2777@gmail.com',
          'igre.kaiser@gmail.com',
          'ashikuzzamanarman@gmail.com',
          'admin@igre.ae',
        ],
      },
    },
    select: { id: true, name: true, phone: true, email: true, role: true, avatarUrl: true },
  });
  const teamOrder = ['igre.asad@gmail.com', 'faisalvpz2777@gmail.com', 'igre.kaiser@gmail.com', 'ashikuzzamanarman@gmail.com', 'admin@igre.ae'];
  const orderedTeam = team.sort((a, b) => teamOrder.indexOf(a.email) - teamOrder.indexOf(b.email));
  const displayTeam = orderedTeam.map((member) => (
    member.email === 'admin@igre.ae' ? { ...member, bio: null, email: '' } : { ...member, bio: null }
  ));

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink pt-28 text-bone sm:pt-32 md:pt-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.pixabay.com/photo/2020/06/02/06/30/abu-dhabi-5249641_1280.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/45" />
        <div className="container-editorial relative z-10 pb-16 md:pb-28">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end md:gap-12">
            <div className="md:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-bone/60">About IGRE</p>
              <h1 className="mt-4 max-w-[12ch] font-display text-5xl leading-[0.98] tracking-editorial sm:text-6xl md:text-8xl md:leading-[0.92]">
                Local brokers for Abu Dhabi.
              </h1>
            </div>
            <div className="md:col-span-5">
              <p className="font-display text-xl leading-[1.2] tracking-editorial text-bone/85 sm:text-2xl md:text-3xl">
                We started IGRE because the city deserved brokers who actually live here.
              </p>
              <p className="mt-6 text-sm leading-[1.8] text-bone/70">
                We work across island addresses, city towers, and mainland villa communities. Clients get direct phone numbers, clear guidance, and advice grounded in Abu Dhabi, not copy-pasted market talk.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-editorial py-12 md:py-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          {[
            ['20+', 'Areas covered'],
            ['Sale & rent', 'Residential focus'],
            ['Direct', 'Phone and WhatsApp'],
          ].map(([value, label]) => (
            <div key={label} className="border-y border-line py-5 md:py-6">
              <p className="font-display text-3xl leading-none tracking-editorial md:text-4xl">{value}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-mute">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <TeamGrid team={displayTeam} />
      <QuietCTA />
    </div>
  );
}
