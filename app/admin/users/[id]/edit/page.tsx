import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserEditForm } from '@/components/admin/UserEditForm';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Edit user · Admin', robots: { index: false } };

interface PageProps { params: Promise<{ id: string }> }

export default async function EditUserPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, bio: true, avatarUrl: true, role: true,
      forcePasswordChange: true, createdAt: true, lastLoginAt: true,
      _count: { select: { listings: true, leads: true } },
    },
  });
  if (!user) notFound();

  const isSelf = session!.user.id === user.id;

  return (
    <div className="max-w-3xl space-y-12">
      <div>
        <Link href="/admin/users" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          ← All users
        </Link>
        <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-mute">Edit user</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">{user.name}</h1>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-mute">
          <span className="font-mono uppercase tracking-[0.12em]">{user.role}</span>
          <span>{user._count.listings} listings · {user._count.leads} leads</span>
          <span>Member since {formatDate(user.createdAt)}</span>
          {user.lastLoginAt && <span>Last login {formatDate(user.lastLoginAt)}</span>}
        </div>
      </div>

      <UserEditForm user={user} isSelf={isSelf} />
    </div>
  );
}
