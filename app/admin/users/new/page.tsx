import { NewUserForm } from '@/components/admin/NewUserForm';

export const metadata = { title: 'Add user · Admin', robots: { index: false } };

export default function NewUserPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">New user</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
          Add an account.
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm text-mute">
          Creates the account and shows the initial password once. The user will be forced to change it on first login.
        </p>
      </div>
      <NewUserForm />
    </div>
  );
}
