'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { listingCreateSchema, type ListingCreateInput } from '@/lib/validations/listing';
import { ImageUploader } from './ImageUploader';
import { cn } from '@/lib/utils';

interface AreaOption { id: string; name: string; slug: string }
interface AgentOption { id: string; name: string }

interface Props {
  mode: 'create' | 'edit';
  listingId?: string;
  initialValues?: Partial<ListingCreateInput> & {
    images?: string[];
    features?: string[];
    coverImageUrl?: string;
    status?: string;
  };
  areas: AreaOption[];
  agents?: AgentOption[]; // Only passed for ADMIN
  isAdmin: boolean;
  ownerId: string;
}

// Form-level schema: omit coverImageUrl (we set it from images[0]) and use string features field
const formSchema = listingCreateSchema.omit({ coverImageUrl: true }).extend({
  images: z.array(z.string().url()).min(1, 'Add at least one image'),
});
type FormValues = z.infer<typeof formSchema>;

const PROP_TYPES = [
  { v: 'APARTMENT', label: 'Apartment' },
  { v: 'VILLA', label: 'Villa' },
  { v: 'TOWNHOUSE', label: 'Townhouse' },
  { v: 'PENTHOUSE', label: 'Penthouse' },
  { v: 'STUDIO', label: 'Studio' },
  { v: 'OFFPLAN', label: 'Off-plan' },
];
const LIST_TYPES = [
  { v: 'SALE', label: 'For sale' },
  { v: 'RENT', label: 'For rent' },
  { v: 'LEASE', label: 'Lease' },
];

const COMMON_FEATURES = [
  'Sea view', 'Canal view', 'City view', 'Beach access',
  "Maid's room", "Driver's room", 'Furnished', 'Built-in wardrobes',
  'Pool', 'Gym', 'Concierge', '24/7 security',
  'Covered parking', '2 parking spaces', 'Private pool', 'Private garden',
  'Italian kitchen', 'Off-plan',
];

export function ListingForm({ mode, listingId, initialValues, areas, agents, isAdmin, ownerId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      listingType: initialValues?.listingType ?? 'SALE',
      propertyType: initialValues?.propertyType ?? 'APARTMENT',
      bedrooms: initialValues?.bedrooms ?? 2,
      bathrooms: initialValues?.bathrooms ?? 2,
      sqft: initialValues?.sqft ?? 1200,
      parkingSpaces: initialValues?.parkingSpaces ?? 1,
      furnished: initialValues?.furnished ?? false,
      yearBuilt: initialValues?.yearBuilt,
      price: initialValues?.price ?? 1500000,
      serviceCharges: initialValues?.serviceCharges,
      paymentPlan: initialValues?.paymentPlan,
      areaId: initialValues?.areaId ?? areas[0]?.id ?? '',
      buildingName: initialValues?.buildingName ?? '',
      floorNumber: initialValues?.floorNumber,
      unitNumber: initialValues?.unitNumber ?? '',
      fullAddress: initialValues?.fullAddress ?? '',
      features: initialValues?.features ?? [],
      images: initialValues?.images ?? [],
      agentId: isAdmin ? (initialValues?.agentId ?? ownerId) : ownerId,
    },
  });

  const images = watch('images') ?? [];
  const features = watch('features') ?? [];

  const toggleFeature = (f: string) => {
    const next = features.includes(f) ? features.filter((x) => x !== f) : [...features, f];
    setValue('features', next, { shouldDirty: true });
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...data, coverImageUrl: data.images[0] };
      const url = mode === 'create' ? '/api/listings' : `/api/listings/${listingId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed to save');
      }
      const body = await res.json();
      router.refresh();
      router.push(`/dashboard/listings/${body.id ?? listingId}/edit?saved=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-mute';
  const labelCls = 'block text-[11px] uppercase tracking-[0.18em] text-mute mb-2';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {/* Basics */}
      <Section title="Basics" subtitle="Headline, description, and how you're offering it.">
        <div className="space-y-6">
          <div>
            <label className={labelCls}>Title</label>
            <input
              {...register('title')}
              placeholder='e.g. "A three-bedroom on Saadiyat Beach. Sea view, walking to the Louvre."'
              className={inputCls}
            />
            {errors.title && <p className={errCls}>{errors.title.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              {...register('description')}
              rows={5}
              className={`${inputCls} resize-none`}
              placeholder="Honest description. Mention what makes this unit specific."
            />
            {errors.description && <p className={errCls}>{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className={labelCls}>Listing type</label>
              <select {...register('listingType')} className={inputCls}>
                {LIST_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Property type</label>
              <select {...register('propertyType')} className={inputCls}>
                {PROP_TYPES.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Area</label>
              <select {...register('areaId')} className={inputCls}>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.areaId && <p className={errCls}>{errors.areaId.message}</p>}
            </div>
          </div>
        </div>
      </Section>

      {/* Specs */}
      <Section title="Specifications" subtitle="Bedrooms, bathrooms, area.">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          <div>
            <label className={labelCls}>Bedrooms</label>
            <input type="number" min={0} {...register('bedrooms', { valueAsNumber: true })} className={inputCls} />
            {errors.bedrooms && <p className={errCls}>{errors.bedrooms.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Bathrooms</label>
            <input type="number" min={0} {...register('bathrooms', { valueAsNumber: true })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Built-up (sqft)</label>
            <input type="number" min={1} {...register('sqft', { valueAsNumber: true })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Parking</label>
            <input type="number" min={0} {...register('parkingSpaces', { valueAsNumber: true })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Year built</label>
            <input type="number" min={1900} max={2100} {...register('yearBuilt', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })} className={inputCls} />
          </div>
        </div>
        <label className="mt-6 flex items-center gap-3 text-sm">
          <input type="checkbox" {...register('furnished')} className="h-4 w-4 accent-ink" />
          <span>Furnished</span>
        </label>
      </Section>

      {/* Pricing */}
      <Section title="Pricing" subtitle="Sale: total. Rent: annual.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className={labelCls}>Price (AED)</label>
            <input type="number" min={1} {...register('price', { valueAsNumber: true })} className={`${inputCls} tnum`} />
            {errors.price && <p className={errCls}>{errors.price.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Service charges /yr</label>
            <input type="number" min={0} {...register('serviceCharges', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })} className={`${inputCls} tnum`} />
          </div>
          <div>
            <label className={labelCls}>Payment plan</label>
            <input type="text" placeholder="e.g. 60/40, 10% down" {...register('paymentPlan')} className={inputCls} />
          </div>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location" subtitle="Building, floor, address.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className={labelCls}>Building name</label>
            <input type="text" {...register('buildingName')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Unit</label>
            <input type="text" {...register('unitNumber')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Floor</label>
            <input type="number" min={0} {...register('floorNumber', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })} className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Full address</label>
            <input type="text" {...register('fullAddress')} className={inputCls} />
            {errors.fullAddress && <p className={errCls}>{errors.fullAddress.message}</p>}
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section title="Features" subtitle="Pick the relevant ones, or add custom.">
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map((f) => {
            const on = features.includes(f);
            return (
              <button
                type="button"
                key={f}
                onClick={() => toggleFeature(f)}
                className={cn(
                  'border px-3 py-1.5 text-xs transition',
                  on ? 'border-ink bg-ink text-bone' : 'border-line text-mute hover:border-ink hover:text-ink',
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Media */}
      <Section title="Photography" subtitle="Cover image is the first one. Drag to reorder.">
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUploader images={field.value ?? []} onChange={field.onChange} />
          )}
        />
        {errors.images && <p className={errCls}>{errors.images.message as string}</p>}
      </Section>

      {/* Admin: assign to agent */}
      {isAdmin && agents && (
        <Section title="Assign agent" subtitle="Admin only. Manager listings auto-assign.">
          <select {...register('agentId')} className={inputCls}>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Section>
      )}

      {error && (
        <div className="border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>
      )}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-between border-t border-line bg-bone px-6 py-4 md:-mx-12 md:px-12">
        <Link href="/dashboard/listings" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          ← Back to listings
        </Link>
        <div className="flex items-center gap-4">
          {isDirty && <span className="text-xs text-mute">Unsaved changes</span>}
          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex items-center gap-3 bg-ink px-6 py-3 text-bone transition-colors hover:bg-gulf disabled:opacity-50"
            data-cursor={submitting ? 'saving' : 'save'}
          >
            <span className="text-[11px] uppercase tracking-[0.28em]">
              {submitting ? 'Saving…' : mode === 'create' ? 'Create listing' : 'Save changes'}
            </span>
          </button>
        </div>
      </div>
    </form>
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
