'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enquirySchema, type EnquiryInput } from '@/lib/validations/enquiry';
import { MagneticButton } from '@/components/motion/MagneticButton';

interface Props {
  listingId: string;
  listingTitle: string;
  agentName: string;
}

export function ListingEnquiryForm({ listingId, listingTitle, agentName }: Props) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      type: 'PROPERTY_SPECIFIC',
      listingId,
      message: `I'd like to know more about ${listingTitle}.`,
    },
  });

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
        throw new Error(body?.error?.message || 'Failed to send enquiry');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="border border-line p-8">
        <p className="font-display text-2xl tracking-editorial">Got it.</p>
        <p className="mt-4 text-mute">
          {agentName} will get back to you within the day. We answer the phone.
        </p>
      </div>
    );
  }

  const inputCls = 'w-full border-0 border-b border-line bg-transparent py-3 text-sm focus:border-ink focus:outline-none placeholder:text-mute';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('listingId')} value={listingId} />
      <input type="hidden" {...register('type')} value="PROPERTY_SPECIFIC" />

      <div>
        <input
          {...register('name')}
          placeholder="Full name"
          className={inputCls}
          autoComplete="name"
        />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
      <div>
        <textarea
          {...register('message')}
          rows={3}
          className={`${inputCls} resize-none`}
        />
        {errors.message && <p className={errCls}>{errors.message.message}</p>}
      </div>

      {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-mute">We reply within the day.</p>
        <MagneticButton
          type="submit"
          disabled={status === 'pending'}
          cursor={status === 'pending' ? 'sending' : 'send'}
          className="group inline-flex items-baseline gap-3 disabled:opacity-50"
        >
          <span className="text-[11px] uppercase tracking-[0.28em]">
            {status === 'pending' ? 'Sending…' : 'Send enquiry'}
          </span>
          <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-20" />
        </MagneticButton>
      </div>
    </form>
  );
}
