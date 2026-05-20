import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Ideal Greenland Real Estate LLC.',
};

const POLICY = [
  ['Information we collect', 'We may collect your name, phone number, email address, property preferences, enquiry message, and any details you choose to share through website forms, WhatsApp, phone calls, or email.'],
  ['How we use it', 'We use your information to respond to enquiries, arrange viewings, suggest relevant properties, manage client relationships, improve our service, and keep records required for legitimate business purposes.'],
  ['Sharing information', 'We may share necessary details with landlords, developers, partner brokers, service providers, or authorities when needed to progress an enquiry, arrange a viewing, complete a transaction, or comply with law.'],
  ['Cookies and analytics', 'The website may use basic cookies or analytics tools to understand site performance and user behaviour. You can manage cookies through your browser settings.'],
  ['Data security', 'We take reasonable steps to protect client information, but no online transmission or storage method is completely secure. Please avoid sending sensitive documents unless requested through an appropriate channel.'],
  ['Your choices', 'You can ask us to update your information or stop non-essential communication. Some records may be retained where required for legal, accounting, compliance, or legitimate business reasons.'],
  ['Contact', 'For privacy questions, contact IGRE at igre.kaiser@gmail.com or call +971 52 569 7323.'],
];

export default function PrivacyPage() {
  return (
    <div className="pt-32 md:pt-40">
      <section className="container-editorial">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Legal</p>
        <h1 className="mt-4 max-w-[14ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-8xl">
          Privacy policy.
        </h1>
        <p className="mt-8 max-w-[62ch] text-base leading-[1.8] text-ink/75">
          This policy explains how Ideal Greenland Real Estate LLC handles information shared through this website and our enquiry channels.
        </p>
      </section>

      <section className="container-editorial mt-20 border-t border-line">
        {POLICY.map(([title, body]) => (
          <article key={title} className="grid grid-cols-1 gap-6 border-b border-line py-10 md:grid-cols-12">
            <h2 className="font-display text-2xl tracking-editorial md:col-span-4 md:text-3xl">{title}</h2>
            <p className="text-sm leading-[1.8] text-ink/75 md:col-span-8">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
