import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Profile', robots: { index: false } };

export default async function ProfilePage() {
  const session = await auth();
  const u = await db.user.findUnique({ where: { id: session!.user.id } });
  if (!u) return null;

  return (
    <div className="max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Profile</p>
      <h1 className="mt-4 font-display text-5xl tracking-editorial md:text-6xl">
        {u.name}
      </h1>

      <dl className="mt-12 divide-y divide-line border-y border-line text-sm">
        <Row label="Email" value={u.email} />
        <Row label="Phone" value={u.phone ?? '—'} />
        <Row label="Role" value={u.role} mono />
        <Row label="Member since" value={formatDate(u.createdAt)} />
      </dl>

      <div className="mt-12">
        <Link
          href="/change-password"
          className="group inline-flex items-baseline gap-3 text-[11px] uppercase tracking-[0.28em]"
        >
          <span>Change password</span>
          <span className="block h-px w-12 bg-ink transition-all duration-500 ease-editorial group-hover:w-24" />
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-mute">{label}</dt>
      <dd className={mono ? 'font-mono text-sm' : 'text-sm'}>{value}</dd>
    </div>
  );
}
