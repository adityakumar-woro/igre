import type { Metadata } from 'next';
import { LoginShell } from '@/components/auth/LoginShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create an account',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <LoginShell
      eyebrow="Create an account"
      title="Save what you like. Track what you ask."
    >
      <RegisterForm />
    </LoginShell>
  );
}
