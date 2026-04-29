import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export const metadata: Metadata = { title: 'Change password', robots: { index: false } };

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen bg-bone">
      <header className="absolute inset-x-0 top-0 z-50 py-6">
        <div className="container-editorial flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-[11px] uppercase tracking-[0.28em] text-mute hover:text-ink">← Home</Link>
        </div>
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 py-32">
        <div className="w-full max-w-md">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Change password</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-editorial">
            {session.user.forcePasswordChange ? 'First, set a password.' : 'Change password.'}
          </h1>
          {session.user.forcePasswordChange && (
            <p className="mt-6 max-w-[42ch] text-sm text-mute">
              You&apos;re using a default password set during onboarding. Choose a new one to continue.
            </p>
          )}
          <ChangePasswordForm forced={session.user.forcePasswordChange} />
        </div>
      </main>
    </div>
  );
}
