import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Users · Admin', robots: { index: false } };

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'Public',
};

interface PageProps { searchParams: Promise<{ role?: string; q?: string }> }

const ROLES = [
  { v: '',        label: 'All' },
  { v: 'ADMIN',   label: 'Admin' },
  { v: 'MANAGER', label: 'Managers' },
  { v: 'USER',    label: 'Public users' },
];

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role, q } = await searchParams;
  const where = {
    ...(role && ['ADMIN', 'MANAGER', 'USER'].includes(role) && { role }),
    ...(q && {
      OR: [{ name: { contains: q } }, { email: { contains: q } }],
    }),
  };

  const users = await db.user.findMany({
    where,
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      createdAt: true, lastLoginAt: true, forcePasswordChange: true,
      _count: { select: { listings: true, leads: true } },
    },
  });

  const total = await db.user.count();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Users</p>
          <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
            {users.length === total ? `${total} users` : `${users.length} of ${total}`}
          </h1>
        </div>
        <Link
          href="/admin/users/new"
          data-cursor="new user"
          className="inline-flex items-center gap-3 self-start bg-ink px-5 py-2.5 text-bone hover:bg-gulf md:self-auto"
        >
          <span className="text-[11px] uppercase tracking-[0.28em]">Add user</span>
          <span className="text-lg leading-none">+</span>
        </Link>
      </div>

      <form className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search name or email…"
          className="w-full border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none md:max-w-md"
        />
        <select
          name="role"
          defaultValue={role ?? ''}
          className="w-full border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none cursor-pointer md:w-48"
        >
          {ROLES.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
        </select>
        <button
          type="submit"
          className="border border-line px-4 py-2 text-xs uppercase tracking-[0.18em] text-mute hover:border-ink hover:text-ink"
        >
          Filter
        </button>
      </form>

      <div className="overflow-hidden border border-line bg-bone">
        <table className="w-full text-sm">
          <thead className="bg-sand/30 text-left text-xs uppercase tracking-[0.18em] text-mute">
            <tr>
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Role</th>
              <th className="px-4 py-3 font-normal">Listings</th>
              <th className="px-4 py-3 font-normal">Leads</th>
              <th className="px-4 py-3 font-normal">Last login</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-sand/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}/edit`} className="hover:text-gold">{u.name}</Link>
                  {u.forcePasswordChange && (
                    <span className="ml-2 inline-block bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                      pw reset
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-mute">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                    u.role === 'ADMIN' ? 'text-gold' : u.role === 'MANAGER' ? 'text-gulf' : 'text-mute'
                  }`}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 tnum">{u._count.listings}</td>
                <td className="px-4 py-3 tnum">{u._count.leads}</td>
                <td className="px-4 py-3 text-xs text-mute">
                  {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}/edit`}
                    className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink"
                    data-cursor="edit"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
