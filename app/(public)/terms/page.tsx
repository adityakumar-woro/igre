import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and conditions for using the IGRE website and enquiry services.',
};

const TERMS = [
  ['Website use', 'This website is provided by Ideal Greenland Real Estate LLC for general property information, enquiries, and client communication. By using the website, you agree to use it lawfully and not misuse forms, listings, images, or contact details.'],
  ['Property information', 'Prices, availability, sizes, images, floor details, and descriptions are provided for guidance only and may change without notice. Final details must be confirmed directly with IGRE before any viewing, offer, lease, or purchase decision.'],
  ['No financial or legal advice', 'Content on this website is not legal, tax, mortgage, investment, or financial advice. Clients should take independent professional advice before signing contracts or making payments.'],
  ['Enquiries and communication', 'When you submit an enquiry, IGRE may contact you by phone, WhatsApp, email, or other relevant channels to respond to your request. Submitting an enquiry does not create a binding agency agreement by itself.'],
  ['Intellectual property', 'Website text, design, branding, and original content belong to IGRE or its licensors. You may not copy, republish, or commercially reuse site content without written permission.'],
  ['Liability', 'IGRE works to keep information accurate, but does not guarantee that all website content is complete, current, or error-free. To the fullest extent permitted by UAE law, IGRE is not liable for losses arising from reliance on unconfirmed website information.'],
];

export default function TermsPage() {
  return (
    <div className="pt-32 md:pt-40">
      <section className="container-editorial">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Legal</p>
        <h1 className="mt-4 max-w-[14ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-8xl">
          Terms and conditions.
        </h1>
        <p className="mt-8 max-w-[62ch] text-base leading-[1.8] text-ink/75">
          These terms explain how the IGRE website and enquiry services should be used. They are written for clarity, not to replace formal legal advice.
        </p>
      </section>

      <section className="container-editorial mt-20 border-t border-line">
        {TERMS.map(([title, body]) => (
          <article key={title} className="grid grid-cols-1 gap-6 border-b border-line py-10 md:grid-cols-12">
            <h2 className="font-display text-2xl tracking-editorial md:col-span-4 md:text-3xl">{title}</h2>
            <p className="text-sm leading-[1.8] text-ink/75 md:col-span-8">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
