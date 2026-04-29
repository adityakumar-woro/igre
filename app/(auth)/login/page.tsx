import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginShell } from '@/components/auth/LoginShell';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <LoginShell
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Pick the role you sign in as. We'll route you to the right dashboard."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </LoginShell>
  );
}
