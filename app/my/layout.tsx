import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { auth, signOut } from '@/lib/auth';

const NAV = [
  { href: '/my/favourites', label: 'Favourites' },
  { href: '/my/enquiries', label: 'Enquiries' },
  { href: '/my/viewings', label: 'Viewings' },
  { href: '/my/profile', label: 'Profile' },
];

export default async function MyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-line">
        <div className="container-editorial flex items-center justify-between py-6">
          <div className="flex items-center gap-12">
            <Logo />
            <span className="hidden text-[11px] uppercase tracking-[0.28em] text-mute md:inline">
              My account
            </span>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
        <nav className="container-editorial flex gap-8 overflow-x-auto pb-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container-editorial py-16">{children}</main>
    </div>
  );
}
