'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  bio: string | null;
  forcePasswordChange: boolean;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  bio: string;
  forcePasswordChange: boolean;
}

interface Props { user: User; isSelf: boolean }

export function UserEditForm({ user, isSelf }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role as 'ADMIN' | 'MANAGER' | 'USER',
      bio: user.bio ?? '',
      forcePasswordChange: user.forcePasswordChange,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          role: data.role,
          bio: data.bio || null,
          forcePasswordChange: data.forcePasswordChange,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  async function resetPassword() {
    if (!confirm(`Reset ${user.name}'s password? They'll be forced to set a new one on next login.`)) return;
    setResetting(true);
    setError(null);
    setResetResult(null);
    try {
      const res = await fetch(`/api/users/${user.id}/reset-password`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      const body = await res.json();
      setResetResult(body.newPassword);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setResetting(false);
    }
  }

  async function deleteUser() {
    if (!confirm(`Delete ${user.name}? Their listings and leads will be reassigned to you.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      router.push('/admin/users');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setDeleting(false);
    }
  }

  const inputCls = 'w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-mute';
  const labelCls = 'block text-[11px] uppercase tracking-[0.18em] text-mute mb-2';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <div className="space-y-12">
      {resetResult && (
        <div className="border border-success/30 bg-success/5 p-6">
          <p className="font-display text-2xl tracking-editorial">Password reset.</p>
          <p className="mt-2 text-sm text-mute">Send this temporary password to {user.name}:</p>
          <p className="mt-4 font-mono text-lg">
            <code className="select-all bg-bone px-3 py-1">{resetResult}</code>
          </p>
          <p className="mt-3 text-xs italic text-mute">Will not be shown again.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input {...register('name', { required: true, minLength: 2 })} className={inputCls} />
            {errors.name && <p className={errCls}>Name is required</p>}
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" {...register('email', { required: true })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" {...register('phone')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <select {...register('role')} disabled={isSelf} className={inputCls}>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="USER">Public user</option>
            </select>
            {isSelf && <p className="mt-1 text-xs text-mute">You cannot change your own role.</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Bio</label>
          <textarea {...register('bio')} rows={3} className={`${inputCls} resize-none`} />
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" {...register('forcePasswordChange')} className="h-4 w-4 accent-ink" />
          <span>Force password change on next login</span>
        </label>

        {error && <div className="border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

        <div className="flex flex-col items-baseline gap-4 border-t border-line pt-6 md:flex-row md:justify-between">
          <Link href="/admin/users" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
            ← All users
          </Link>
          <div className="flex items-center gap-4">
            {savedAt && !isDirty && <span className="text-xs text-success">✓ Saved</span>}
            {isDirty && <span className="text-xs text-mute">Unsaved changes</span>}
            <button
              type="submit"
              disabled={saving}
              className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-bone hover:bg-gulf disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>

      {/* Danger zone */}
      <section className="border border-danger/30 bg-danger/5 p-6">
        <h2 className="font-display text-2xl tracking-editorial text-danger">Danger zone</h2>
        <div className="mt-6 space-y-4">
          <div className="flex flex-col items-baseline justify-between gap-3 md:flex-row">
            <div>
              <p className="text-sm">Reset password</p>
              <p className="text-xs text-mute">
                Generates a new temp password. User will be forced to change it on next login.
              </p>
            </div>
            <button
              type="button"
              onClick={resetPassword}
              disabled={resetting}
              className="border border-danger/40 bg-bone px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-danger hover:bg-danger/10 disabled:opacity-50"
            >
              {resetting ? 'Resetting…' : 'Reset password'}
            </button>
          </div>
          {!isSelf && (
            <div className="flex flex-col items-baseline justify-between gap-3 border-t border-danger/20 pt-4 md:flex-row">
              <div>
                <p className="text-sm">Delete account</p>
                <p className="text-xs text-mute">
                  Reassigns their listings and leads to you. Cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={deleteUser}
                disabled={deleting}
                className="bg-danger px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-bone hover:bg-danger/80 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
