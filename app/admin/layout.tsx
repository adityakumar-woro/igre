import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/admin');
  if (session.user.role !== 'ADMIN') redirect('/403');

  const user = {
    name: session.user.name ?? 'Admin',
    email: session.user.email ?? '',
  };

  async function signOutAction() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminSidebar user={user} signOutAction={signOutAction} />
      <AdminMobileNav user={user} signOutAction={signOutAction} />
      <main className="md:ml-64">
        <div className="px-6 py-10 md:px-12 md:py-14">{children}</div>
      </main>
    </div>
  );
}
