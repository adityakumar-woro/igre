'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/listings', label: 'Listings' },
  { href: '/areas', label: 'Areas' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardHref = session?.user?.role === 'ADMIN'
    ? '/admin'
    : session?.user?.role === 'MANAGER'
      ? '/dashboard'
      : '/my/favourites';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-editorial',
        scrolled ? 'bg-bone/85 backdrop-blur-md py-4' : 'bg-transparent py-6',
      )}
    >
      <div className="container-editorial flex items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-cursor="open"
              className={cn(
                'text-[13px] uppercase tracking-[0.18em] transition-colors',
                pathname.startsWith(item.href) ? 'text-ink' : 'text-mute hover:text-ink',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {status === 'authenticated' ? (
            <>
              <Link
                href={dashboardHref}
                data-cursor="enter"
                className="text-[13px] uppercase tracking-[0.18em] text-ink"
              >
                {session.user.role === 'ADMIN' ? 'Admin' : session.user.role === 'MANAGER' ? 'Dashboard' : 'My account'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                data-cursor="sign out"
                className="text-[13px] uppercase tracking-[0.18em] text-mute hover:text-ink"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              data-cursor="sign in"
              className="text-[13px] uppercase tracking-[0.18em] text-ink"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className={cn('block h-px w-6 bg-ink transition-transform duration-300', open && 'translate-y-[3px] rotate-45')} />
          <span className={cn('block h-px w-6 bg-ink transition-transform duration-300', open && '-translate-y-[3px] -rotate-45')} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 top-[72px] z-40 bg-bone transition-opacity duration-500 md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <nav className="container-editorial flex flex-col gap-6 pt-12">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display text-4xl tracking-editorial"
            >
              {item.label}
            </Link>
          ))}
          <div className="rule mt-6" />
          {status === 'authenticated' ? (
            <>
              <Link href={dashboardHref} onClick={() => setOpen(false)} className="text-sm uppercase tracking-[0.18em]">
                {session.user.role === 'ADMIN' ? 'Admin' : session.user.role === 'MANAGER' ? 'Dashboard' : 'My account'}
              </Link>
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
                className="self-start text-sm uppercase tracking-[0.18em] text-mute"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="text-sm uppercase tracking-[0.18em]">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
