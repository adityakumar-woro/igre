'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { MagneticButton } from '@/components/motion/MagneticButton';

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setPending(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Registration failed');
      }
      // Auto-sign in
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.refresh();
      router.push('/my/favourites');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setPending(false);
    }
  };

  const inputCls = 'w-full border-0 border-b border-line bg-transparent py-4 text-base focus:border-ink focus:outline-none placeholder:text-mute';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-12 space-y-8">
      <div>
        <input {...register('name')} placeholder="Full name" autoComplete="name" className={inputCls} />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>
      <div>
        <input {...register('email')} type="email" placeholder="Email" autoComplete="email" className={inputCls} />
        {errors.email && <p className={errCls}>{errors.email.message}</p>}
      </div>
      <div>
        <input {...register('phone')} type="tel" placeholder="Phone (optional)" autoComplete="tel" className={inputCls} />
        {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
      </div>
      <div>
        <input {...register('password')} type="password" placeholder="Password (10+ chars, letters & numbers)" autoComplete="new-password" className={inputCls} />
        {errors.password && <p className={errCls}>{errors.password.message}</p>}
      </div>

      {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

      <div className="flex items-center justify-between border-t border-line pt-8">
        <Link href="/login" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          Already have an account?
        </Link>
        <MagneticButton
          type="submit"
          disabled={pending}
          cursor={pending ? 'creating' : 'create'}
          className="group inline-flex items-baseline gap-3 disabled:opacity-50"
        >
          <span className="text-[11px] uppercase tracking-[0.28em]">
            {pending ? 'Creating…' : 'Create account'}
          </span>
          <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
        </MagneticButton>
      </div>
    </form>
  );
}
