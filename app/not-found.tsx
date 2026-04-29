import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <header className="py-6">
        <div className="container-editorial">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-mute">404</p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
            Page not found. Some properties move faster than others.
          </h1>
          <div className="mt-12 flex flex-col items-center gap-4">
            <Link
              href="/listings"
              data-cursor="browse"
              className="group inline-flex items-baseline gap-3 text-[11px] uppercase tracking-[0.28em]"
            >
              <span>See what&apos;s available</span>
              <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
            </Link>
            <Link href="/" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
