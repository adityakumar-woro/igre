import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Profile · Dashboard', robots: { index: false } };

export default async function DashboardProfilePage() {
  const session = await auth();
  const me = await db.user.findUnique({
    where: { id: session!.user.id },
    select: { id: true, name: true, email: true, phone: true, bio: true, avatarUrl: true, role: true, createdAt: true, lastLoginAt: true },
  });
  if (!me) return null;

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Profile</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">{me.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-mute">
          <span>{me.email}</span>
          <span className="font-mono uppercase">{me.role}</span>
          <span>Member since {formatDate(me.createdAt)}</span>
        </div>
      </div>

      <ProfileForm
        initial={{
          name: me.name,
          phone: me.phone,
          bio: me.bio,
          avatarUrl: me.avatarUrl,
        }}
      />
    </div>
  );
}
