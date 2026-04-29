'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormValues {
  company_name: string;
  company_phone: string;
  company_email: string;
  company_address: string;
  company_map_url: string;
  rera_license: string;
  instagram_url: string;
  linkedin_url: string;
  whatsapp_number: string;
  footer_copyright: string;
  listing_disclaimer: string;
}

export function SettingsForm({ initial }: { initial: Partial<FormValues> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      company_name: initial.company_name ?? '',
      company_phone: initial.company_phone ?? '',
      company_email: initial.company_email ?? '',
      company_address: initial.company_address ?? '',
      company_map_url: initial.company_map_url ?? '',
      rera_license: initial.rera_license ?? '',
      instagram_url: initial.instagram_url ?? '',
      linkedin_url: initial.linkedin_url ?? '',
      whatsapp_number: initial.whatsapp_number ?? '',
      footer_copyright: initial.footer_copyright ?? '',
      listing_disclaimer: initial.listing_disclaimer ?? '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-mute';
  const labelCls = 'block text-[11px] uppercase tracking-[0.18em] text-mute mb-2';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <Section title="Company" subtitle="Shown in the footer and on contact pages.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Company name" name="company_name" register={register} />
          <Field label="RERA license" name="rera_license" register={register} placeholder="e.g. RERA-12345" />
          <Field label="Phone" name="company_phone" register={register} />
          <Field label="Email" name="company_email" register={register} />
          <Field label="Address" name="company_address" register={register} className="md:col-span-2" />
          <Field label="Google Maps URL" name="company_map_url" register={register} className="md:col-span-2" />
        </div>
      </Section>

      <Section title="Social" subtitle="Linked from the footer.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Field label="Instagram URL" name="instagram_url" register={register} />
          <Field label="LinkedIn URL" name="linkedin_url" register={register} />
          <Field label="WhatsApp number" name="whatsapp_number" register={register} placeholder="971581005220" />
        </div>
      </Section>

      <Section title="Public copy" subtitle="Used in the footer and on every listing page.">
        <div className="space-y-6">
          <div>
            <label className={labelCls}>Footer copyright</label>
            <input {...register('footer_copyright')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Listing disclaimer</label>
            <textarea {...register('listing_disclaimer')} rows={3} className={`${inputCls} resize-none`} />
          </div>
        </div>
      </Section>

      {error && <div className="border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-between border-t border-line bg-bone px-6 py-4 md:-mx-12 md:px-12">
        <span className="text-xs text-mute">Settings apply immediately on save.</span>
        <div className="flex items-center gap-4">
          {savedAt && !isDirty && <span className="text-xs text-success">✓ Saved</span>}
          {isDirty && <span className="text-xs text-mute">Unsaved changes</span>}
          <button
            type="submit"
            disabled={saving}
            className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-bone hover:bg-gulf disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label, name, register, placeholder, className,
}: {
  label: string;
  name: keyof FormValues;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-2">{label}</label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className="w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-mute"
      />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-12">
      <div className="md:col-span-3">
        <h3 className="font-display text-2xl tracking-editorial">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-mute">{subtitle}</p>}
      </div>
      <div className="md:col-span-9">{children}</div>
    </section>
  );
}
