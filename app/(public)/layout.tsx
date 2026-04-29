import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

// Footer queries SiteSetting at render time. With SQLite the DB file only
// exists at runtime, so we must opt out of static prerender during build.
export const dynamic = 'force-dynamic';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
