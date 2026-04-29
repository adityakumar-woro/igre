'use client';

import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageUploader } from '@/components/dashboard/ImageUploader';

interface AreaInitial {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImageUrl: string;
  images: string[];
  startingPrice2BhkSale: number | null;
  startingPrice3BhkSale: number | null;
  startingPriceVillaSale: number | null;
  startingPrice2BhkRent: number | null;
  startingPrice3BhkRent: number | null;
  startingPriceVillaRent: number | null;
  freehold: boolean;
  distanceToAirportKm: number | null;
  isFeatured: boolean;
  sortOrder: number;
}

type FormValues = Omit<AreaInitial, 'id' | 'slug'>;

export function AreaEditForm({ initial }: { initial: AreaInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: initial.name,
      tagline: initial.tagline,
      description: initial.description,
      heroImageUrl: initial.heroImageUrl,
      images: initial.images,
      startingPrice2BhkSale: initial.startingPrice2BhkSale,
      startingPrice3BhkSale: initial.startingPrice3BhkSale,
      startingPriceVillaSale: initial.startingPriceVillaSale,
      startingPrice2BhkRent: initial.startingPrice2BhkRent,
      startingPrice3BhkRent: initial.startingPrice3BhkRent,
      startingPriceVillaRent: initial.startingPriceVillaRent,
      freehold: initial.freehold,
      distanceToAirportKm: initial.distanceToAirportKm,
      isFeatured: initial.isFeatured,
      sortOrder: initial.sortOrder,
    },
  });

  const heroUrl = watch('heroImageUrl');

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setError(null);
    try {
      // Convert empty strings / NaN to null for nullable price fields
      const normalize = (v: unknown) => v === '' || v === null || (typeof v === 'number' && Number.isNaN(v)) ? null : v;
      const payload = {
        ...data,
        startingPrice2BhkSale: normalize(data.startingPrice2BhkSale),
        startingPrice3BhkSale: normalize(data.startingPrice3BhkSale),
        startingPriceVillaSale: normalize(data.startingPriceVillaSale),
        startingPrice2BhkRent: normalize(data.startingPrice2BhkRent),
        startingPrice3BhkRent: normalize(data.startingPrice3BhkRent),
        startingPriceVillaRent: normalize(data.startingPriceVillaRent),
        distanceToAirportKm: normalize(data.distanceToAirportKm),
      };
      const res = await fetch(`/api/areas/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  async function uploadHero(file: File) {
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error?.message || 'Upload failed');
      return;
    }
    const data = await res.json();
    setValue('heroImageUrl', data.url, { shouldDirty: true });
  }

  const inputCls = 'w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-mute';
  const labelCls = 'block text-[11px] uppercase tracking-[0.18em] text-mute mb-2';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <Section title="Identity" subtitle="Name, tagline, description.">
        <div className="space-y-6">
          <div>
            <label className={labelCls}>Name</label>
            <input {...register('name', { required: true })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input {...register('tagline', { required: true })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea {...register('description', { required: true })} rows={6} className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('freehold')} className="h-4 w-4 accent-ink" />
              <span>Freehold</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 accent-ink" />
              <span>Featured</span>
            </label>
            <div>
              <label className={labelCls}>Sort order</label>
              <input type="number" {...register('sortOrder', { valueAsNumber: true })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>km to AUH</label>
              <input
                type="number"
                step="0.1"
                {...register('distanceToAirportKm', { setValueAs: (v) => v === '' ? null : Number(v) })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Hero photograph" subtitle="The image at the top of the area page and across the site.">
        <div className="space-y-3">
          {heroUrl && (
            <div className="aspect-[16/9] w-full overflow-hidden bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex items-baseline gap-3">
            <input {...register('heroImageUrl')} className={inputCls} placeholder="https://…" />
            <label className="shrink-0 cursor-pointer border border-line bg-bone px-4 py-2 text-xs uppercase tracking-[0.18em] hover:border-ink">
              Upload
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadHero(f); }}
              />
            </label>
          </div>
        </div>
      </Section>

      <Section title="Gallery" subtitle="Drag to reorder. Used on the area page below the hero.">
        <Controller
          control={control}
          name="images"
          render={({ field }) => <ImageUploader images={field.value ?? []} onChange={field.onChange} max={12} />}
        />
      </Section>

      <Section title="Starting prices — sale" subtitle="AED. Indicative starting price; shown on the area page with the standard disclaimer.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PriceField name="startingPrice2BhkSale" label="2BHK" register={register} />
          <PriceField name="startingPrice3BhkSale" label="3BHK" register={register} />
          <PriceField name="startingPriceVillaSale" label="Villa" register={register} />
        </div>
      </Section>

      <Section title="Starting prices — rent" subtitle="AED per year. Leave blank if not applicable.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PriceField name="startingPrice2BhkRent" label="2BHK" register={register} />
          <PriceField name="startingPrice3BhkRent" label="3BHK" register={register} />
          <PriceField name="startingPriceVillaRent" label="Villa" register={register} />
        </div>
      </Section>

      {error && <div className="border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-between border-t border-line bg-bone px-6 py-4 md:-mx-12 md:px-12">
        <Link href="/admin/areas" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          ← All areas
        </Link>
        <div className="flex items-center gap-4">
          {savedAt && !isDirty && <span className="text-xs text-success">✓ Saved</span>}
          {isDirty && <span className="text-xs text-mute">Unsaved changes</span>}
          <button
            type="submit"
            disabled={saving}
            className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-bone hover:bg-gulf disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save area'}
          </button>
        </div>
      </div>
    </form>
  );
}

function PriceField({ name, label, register }: { name: keyof FormValues; label: string; register: ReturnType<typeof useForm<FormValues>>['register'] }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-2">{label}</label>
      <input
        type="number"
        min={0}
        {...register(name, { setValueAs: (v) => v === '' ? null : Number(v) })}
        className="w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none tnum"
        placeholder="—"
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
