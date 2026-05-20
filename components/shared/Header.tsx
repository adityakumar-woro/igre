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

  // Lock body scroll while the mobile drawer is open. Without this, scrolling
  // the drawer bleeds to the page underneath, which made the drawer *look*
  // transparent (the page content appeared to slide behind it).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close the drawer on route change (so a tap on a nav link feels right)
  useEffect(() => { setOpen(false); }, [pathname]);

  const dashboardHref = session?.user?.role === 'ADMIN'
    ? '/admin'
    : session?.user?.role === 'MANAGER'
      ? '/dashboard'
      : '/my/favourites';
  const dashboardLabel = session?.user?.role === 'ADMIN'
    ? 'Admin dashboard'
    : session?.user?.role === 'MANAGER'
      ? 'Agent dashboard'
      : 'Client dashboard';

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-editorial',
          // When the drawer is open on mobile, force opaque header background so
          // the page content can't bleed through the strip behind the close button.
          open
            ? 'bg-bone py-4'
            : scrolled
              ? 'bg-bone/85 backdrop-blur-md py-4'
              : 'bg-transparent py-6',
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
                  {dashboardLabel}
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
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span className={cn('block h-px w-6 bg-ink transition-transform duration-300', open && 'translate-y-[3px] rotate-45')} />
            <span className={cn('block h-px w-6 bg-ink transition-transform duration-300', open && '-translate-y-[3px] -rotate-45')} />
          </button>
        </div>
      </header>

      {/* Mobile drawer — full viewport, opaque, scroll-locked.
          z-40 sits below the header (z-50) so the close button stays clickable. */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 overflow-y-auto bg-bone transition-opacity duration-500 ease-editorial md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <nav className="container-editorial flex flex-col gap-2 pb-12 pt-28">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-5 font-display text-4xl tracking-editorial"
              style={{
                transitionDelay: open ? `${i * 60}ms` : '0ms',
                transitionDuration: '600ms',
                transitionProperty: 'opacity, transform',
                transitionTimingFunction: 'ease',
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(-12px)',
              }}
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-10 flex flex-col gap-3">
            {status === 'authenticated' ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-between border border-ink px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-ink"
                >
                  <span>{dashboardLabel}</span>
                  <span>→</span>
                </Link>
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="self-start text-xs uppercase tracking-[0.18em] text-mute"
                >
                  Sign out →
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-between border border-ink bg-ink px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-bone"
              >
                <span>Sign in</span>
                <span>→</span>
              </Link>
            )}
          </div>

          <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.28em] text-mute">
            Real Estate · Abu Dhabi
          </p>
        </nav>
      </div>
    </>
  );
}
