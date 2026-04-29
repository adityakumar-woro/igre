import Link from 'next/link';
import { db } from '@/lib/db';

export const metadata = { title: 'Audit log · Admin', robots: { index: false } };

interface PageProps {
  searchParams: Promise<{ action?: string; entityType?: string; userId?: string; page?: string }>;
}

const PER_PAGE = 50;

export default async function AuditLogPage({ searchParams }: PageProps) {
  const { action, entityType, userId, page = '1' } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const where = {
    ...(action && { action: { contains: action } }),
    ...(entityType && { entityType }),
    ...(userId && { userId }),
  };

  const [entries, total, distinctActions, users] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PER_PAGE,
      skip: (pageNum - 1) * PER_PAGE,
      include: { user: { select: { id: true, name: true, role: true } } },
    }),
    db.auditLog.count({ where }),
    // Distinct action prefixes for the filter dropdown
    db.auditLog.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
    db.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Audit log</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
          {total} {total === 1 ? 'entry' : 'entries'}.
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm text-mute">
          Every privileged action is logged with the actor, IP, and user agent. Read-only.
        </p>
      </div>

      <form className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <select
          name="action"
          defaultValue={action ?? ''}
          className="border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none cursor-pointer md:w-56"
        >
          <option value="">All actions</option>
          {distinctActions.map((a) => <option key={a.action} value={a.action}>{a.action}</option>)}
        </select>
        <select
          name="entityType"
          defaultValue={entityType ?? ''}
          className="border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none cursor-pointer md:w-44"
        >
          <option value="">All entities</option>
          <option value="Listing">Listings</option>
          <option value="Lead">Leads</option>
          <option value="Enquiry">Enquiries</option>
          <option value="ViewingRequest">Viewings</option>
          <option value="User">Users</option>
          <option value="Area">Areas</option>
          <option value="Upload">Uploads</option>
          <option value="SiteSetting">Settings</option>
        </select>
        <select
          name="userId"
          defaultValue={userId ?? ''}
          className="border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none cursor-pointer md:w-56"
        >
          <option value="">Any user</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button
          type="submit"
          className="border border-line px-4 py-2 text-xs uppercase tracking-[0.18em] text-mute hover:border-ink hover:text-ink"
        >
          Filter
        </button>
        <Link href="/admin/audit-log" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          Reset
        </Link>
      </form>

      <div className="overflow-x-auto border border-line bg-bone">
        <table className="w-full text-sm">
          <thead className="bg-sand/30 text-left text-xs uppercase tracking-[0.18em] text-mute">
            <tr>
              <th className="px-4 py-3 font-normal">When</th>
              <th className="px-4 py-3 font-normal">Who</th>
              <th className="px-4 py-3 font-normal">Action</th>
              <th className="px-4 py-3 font-normal">Entity</th>
              <th className="px-4 py-3 font-normal">Metadata</th>
              <th className="px-4 py-3 font-normal">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-sand/20">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-mute">
                  {new Date(e.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dubai' })}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {e.user ? (
                    <span>
                      <span className="text-ink">{e.user.name}</span>
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{e.user.role}</span>
                    </span>
                  ) : (
                    <span className="text-mute italic">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{e.action}</td>
                <td className="whitespace-nowrap px-4 py-3 text-mute">
                  {e.entityType}
                  {e.entityId && (
                    <span className="ml-2 font-mono text-[10px] text-mute/60">{e.entityId.slice(-6)}</span>
                  )}
                </td>
                <td className="max-w-md px-4 py-3 font-mono text-[11px] text-mute">
                  {e.metadata ? (
                    <span className="block truncate">{e.metadata}</span>
                  ) : <span className="text-mute/50">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-mute">{e.ipAddress ?? '—'}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-mute">
                  No entries match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between border-t border-line pt-4 text-xs uppercase tracking-[0.18em]">
          {pageNum > 1 ? (
            <Link href={`?page=${pageNum - 1}${action ? `&action=${action}` : ''}${entityType ? `&entityType=${entityType}` : ''}${userId ? `&userId=${userId}` : ''}`} className="hover:text-gold">
              ← Previous
            </Link>
          ) : <span className="text-mute">← Previous</span>}
          <span className="text-mute">Page {pageNum} of {totalPages}</span>
          {pageNum < totalPages ? (
            <Link href={`?page=${pageNum + 1}${action ? `&action=${action}` : ''}${entityType ? `&entityType=${entityType}` : ''}${userId ? `&userId=${userId}` : ''}`} className="hover:text-gold">
              Next →
            </Link>
          ) : <span className="text-mute">Next →</span>}
        </nav>
      )}
    </div>
  );
}
