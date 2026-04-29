import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export const metadata = { title: 'Access denied' };

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <header className="py-6">
        <div className="container-editorial">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-mute">403</p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
            You don&apos;t have access to this. Talk to your administrator.
          </h1>
          <Link
            href="/"
            data-cursor="home"
            className="group mt-12 inline-flex items-baseline gap-3 text-[11px] uppercase tracking-[0.28em]"
          >
            <span>Back to home</span>
            <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
          </Link>
        </div>
      </main>
    </div>
  );
}
