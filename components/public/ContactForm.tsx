'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enquirySchema, type EnquiryInput } from '@/lib/validations/enquiry';
import { MagneticButton } from '@/components/motion/MagneticButton';

const TYPES: Array<{ v: EnquiryInput['type']; label: string }> = [
  { v: 'GENERAL', label: 'General' },
  { v: 'PROPERTY_SPECIFIC', label: 'A specific property' },
  { v: 'COLLABORATION', label: 'Broker collaboration' },
  { v: 'VALUATION', label: 'Valuation' },
];

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { type: 'GENERAL' },
  });
  const selectedType = watch('type');

  const onSubmit = async (data: EnquiryInput) => {
    setStatus('pending');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed to send');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="border border-line p-12">
        <p className="font-display text-4xl leading-[1.05] tracking-editorial">Got it.</p>
        <p className="mt-6 max-w-[40ch] text-mute">
          One of our brokers will get back to you within the day. If it&apos;s urgent, call <a href="tel:+971581005220" className="text-ink hover:text-gold">+971 58 100 5220</a>.
        </p>
      </div>
    );
  }

  const inputCls = 'w-full border-0 border-b border-line bg-transparent py-4 text-base focus:border-ink focus:outline-none placeholder:text-mute';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div>
        <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-mute">I&apos;m enquiring about</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <label
              key={t.v}
              className={`cursor-pointer border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                selectedType === t.v ? 'border-ink bg-ink text-bone' : 'border-line text-mute hover:border-ink hover:text-ink'
              }`}
              data-cursor="select"
            >
              <input
                type="radio"
                value={t.v}
                {...register('type')}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <input
          {...register('name')}
          placeholder="Full name"
          className={inputCls}
          autoComplete="name"
        />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className={inputCls}
            autoComplete="email"
          />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div>
          <input
            {...register('phone')}
            type="tel"
            placeholder="Phone"
            className={inputCls}
            autoComplete="tel"
          />
          {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
        </div>
      </div>

      {selectedType !== 'COLLABORATION' && (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <input
              {...register('budget', { valueAsNumber: true })}
              type="number"
              placeholder="Budget (AED)"
              className={inputCls}
            />
          </div>
          <div>
            <input
              {...register('preferredArea')}
              placeholder="Preferred area"
              className={inputCls}
            />
          </div>
        </div>
      )}

      <div>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="Tell us what you're looking for"
          className={`${inputCls} resize-none`}
        />
        {errors.message && <p className={errCls}>{errors.message.message}</p>}
      </div>

      {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

      <div className="flex items-center justify-between border-t border-line pt-8">
        <p className="text-xs text-mute">We reply within the day.</p>
        <MagneticButton
          type="submit"
          disabled={status === 'pending'}
          cursor={status === 'pending' ? 'sending' : 'send'}
          className="group inline-flex items-baseline gap-3 disabled:opacity-50"
        >
          <span className="text-[11px] uppercase tracking-[0.28em]">
            {status === 'pending' ? 'Sending…' : 'Send message'}
          </span>
          <span className="block h-px w-16 bg-ink transition-all duration-500 ease-editorial group-hover:w-32" />
        </MagneticButton>
      </div>
    </form>
  );
}
