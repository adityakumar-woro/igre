import { db } from '@/lib/db';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const metadata = { title: 'Settings · Admin', robots: { index: false } };

export default async function AdminSettingsPage() {
  const rows = await db.siteSetting.findMany();
  const initial: Record<string, string> = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Settings</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
          Site configuration.
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm text-mute">
          Company details, social links, RERA license, and the public copy shown in the footer and on listing pages.
        </p>
      </div>

      <SettingsForm initial={initial} />
    </div>
  );
}
