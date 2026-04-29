'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/auth';
import { MagneticButton } from '@/components/motion/MagneticButton';

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const { update } = useSession();
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordInput) => {
    setPending(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      // Refresh JWT so forcePasswordChange flag resets
      await update({ forcePasswordChange: false });
      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push(forced ? '/' : '/my/profile');
      }, 800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setPending(false);
    }
  };

  const inputCls = 'w-full border-0 border-b border-line bg-transparent py-4 text-base focus:border-ink focus:outline-none placeholder:text-mute';
  const errCls = 'mt-1 text-xs text-danger';

  if (success) {
    return (
      <div className="mt-10 border border-line p-8">
        <p className="font-display text-3xl tracking-editorial">Done.</p>
        <p className="mt-3 text-mute">Redirecting…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-12 space-y-8">
      <div>
        <input
          {...register('currentPassword')}
          type="password"
          placeholder={forced ? 'Default password' : 'Current password'}
          autoComplete="current-password"
          autoFocus
          className={inputCls}
        />
        {errors.currentPassword && <p className={errCls}>{errors.currentPassword.message}</p>}
      </div>
      <div>
        <input
          {...register('newPassword')}
          type="password"
          placeholder="New password (10+ chars, letters & numbers)"
          autoComplete="new-password"
          className={inputCls}
        />
        {errors.newPassword && <p className={errCls}>{errors.newPassword.message}</p>}
      </div>
      <div>
        <input
          {...register('confirmPassword')}
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          className={inputCls}
        />
        {errors.confirmPassword && <p className={errCls}>{errors.confirmPassword.message}</p>}
      </div>

      {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

      <div className="flex items-center justify-end border-t border-line pt-8">
        <MagneticButton
          type="submit"
          disabled={pending}
          cursor={pending ? 'updating' : 'update'}
          className="group inline-flex items-baseline gap-3 disabled:opacity-50"
        >
          <span className="text-[11px] uppercase tracking-[0.28em]">
            {pending ? 'Updating…' : 'Update password'}
          </span>
          <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
        </MagneticButton>
      </div>
    </form>
  );
}
