'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  bio: z.string().optional(),
  initialPassword: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function NewUserForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; email: string; password: string; userId: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'MANAGER' },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          initialPassword: data.initialPassword || undefined,
          forcePasswordChange: true,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      const body = await res.json();
      setCreated({
        name: body.user.name,
        email: body.user.email,
        password: body.initialPassword,
        userId: body.user.id,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="space-y-6">
        <div className="border border-success/30 bg-success/5 p-8">
          <p className="font-display text-3xl tracking-editorial">Account created.</p>
          <p className="mt-3 text-sm text-mute">
            Send these credentials to <span className="text-ink">{created.name}</span>. They&apos;ll be required
            to change the password on first login.
          </p>
          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            <Row label="Email" value={created.email} mono />
            <Row label="Temporary password" value={created.password} mono />
          </dl>
          <p className="mt-4 text-xs italic text-mute">
            This password will not be shown again — copy it now.
          </p>
        </div>
        <div className="flex justify-between">
          <Link href="/admin/users" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
            ← All users
          </Link>
          <button
            onClick={() => { setCreated(null); router.refresh(); }}
            className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink"
          >
            Add another →
          </button>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-mute';
  const labelCls = 'block text-[11px] uppercase tracking-[0.18em] text-mute mb-2';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelCls}>Full name</label>
          <input {...register('name')} className={inputCls} />
          {errors.name && <p className={errCls}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" {...register('email')} className={inputCls} />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Phone (optional)</label>
          <input type="tel" {...register('phone')} className={inputCls} placeholder="+971…" />
        </div>
        <div>
          <label className={labelCls}>Role</label>
          <select {...register('role')} className={inputCls}>
            <option value="ADMIN">Admin — full system access</option>
            <option value="MANAGER">Manager — agent dashboard, own listings & leads</option>
            <option value="USER">Public user — favourites & enquiries</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Bio (shown on team page, optional)</label>
        <textarea {...register('bio')} rows={3} className={`${inputCls} resize-none`} />
      </div>

      <div>
        <label className={labelCls}>Initial password (leave blank to auto-generate)</label>
        <input type="text" {...register('initialPassword')} className={`${inputCls} font-mono`} placeholder="Auto-generated" />
        <p className="mt-2 text-xs text-mute">
          Whatever you set, the user will be required to change it on first login.
        </p>
      </div>

      {error && <div className="border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

      <div className="flex items-center justify-between border-t border-line pt-6">
        <Link href="/admin/users" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          ← Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-bone hover:bg-gulf disabled:opacity-50"
          data-cursor={submitting ? 'creating' : 'create'}
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-mute">{label}</dt>
      <dd className={`${mono ? 'font-mono' : ''} text-sm`}>
        <code className="select-all">{value}</code>
      </dd>
    </div>
  );
}
