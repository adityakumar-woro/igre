'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { RoleTabs, type Role } from './RoleTabs';

const ROLE_DEFAULT_REDIRECT: Record<Role, string> = {
  admin:   '/admin',
  manager: '/dashboard',
  user:    '/my/favourites',
};

const ROLE_HINT: Record<Role, string> = {
  admin:   'Use your admin email. You\'ll land on /admin.',
  manager: 'Use the email your office gave you. You\'ll land on /dashboard.',
  user:    'Use the email you signed up with. You\'ll land on /my/favourites.',
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl');

  const [role, setRole] = useState<Role>('manager');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setPending(true);
    setErrorMsg(null);
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setPending(false);

    if (res?.error) {
      setErrorMsg('Email or password is incorrect.');
      return;
    }

    // Use the callback URL if it was passed (e.g. middleware redirect),
    // otherwise route by the chosen role.
    router.refresh();
    router.push(callbackUrl || ROLE_DEFAULT_REDIRECT[role]);
  };

  const inputCls =
    'w-full border-0 border-b border-line bg-transparent py-4 text-base focus:border-ink focus:outline-none placeholder:text-mute';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <div className="space-y-10">
      <RoleTabs active={role} onChange={setRole} />

      <motion.p
        key={role}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-xs text-mute"
      >
        {ROLE_HINT[role]}
      </motion.p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            autoComplete="email"
            autoFocus
            className={inputCls}
          />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className={inputCls}
          />
          {errors.password && <p className={errCls}>{errors.password.message}</p>}
        </div>

        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-sm border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            {errorMsg}
          </motion.p>
        )}

        <div className="flex items-center justify-between border-t border-line pt-8">
          <Link href="/forgot-password" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
            Forgot password?
          </Link>
          <MagneticButton
            type="submit"
            disabled={pending}
            cursor={pending ? 'signing in' : 'sign in'}
            className="group inline-flex items-baseline gap-3 disabled:opacity-50"
          >
            <span className="text-[11px] uppercase tracking-[0.28em]">
              {pending ? 'Signing in…' : 'Sign in'}
            </span>
            <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
          </MagneticButton>
        </div>

        <p className="border-t border-line pt-6 text-sm text-mute">
          New here? <Link href="/register" className="text-ink hover:text-gold">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
