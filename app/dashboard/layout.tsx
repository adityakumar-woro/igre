import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/dashboard');

  const user = {
    id: session.user.id,
    name: session.user.name ?? 'Agent',
    email: session.user.email ?? '',
    role: session.user.role,
  };

  async function signOutAction() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <div className="min-h-screen bg-bone">
      <DashboardSidebar user={user} signOutAction={signOutAction} />
      <MobileNav user={user} signOutAction={signOutAction} />
      <main className="md:ml-64">
        <div className="px-6 py-10 md:px-12 md:py-14">{children}</div>
      </main>
    </div>
  );
}
