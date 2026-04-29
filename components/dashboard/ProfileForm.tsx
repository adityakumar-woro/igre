'use client';

import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Props {
  initial: {
    name: string;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}

interface FormValues {
  name: string;
  phone: string;
  bio: string;
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: initial.name,
      phone: initial.phone ?? '',
      bio: initial.bio ?? '',
    },
  });

  const currentName = watch('name');

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Upload failed');
      }
      const data = await res.json();
      setAvatarUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone || undefined,
          bio: values.bio || undefined,
          avatarUrl,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      // Refresh session so the header / sidebar pick up the new name
      await update();
      router.refresh();
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-line bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-mute';
  const labelCls = 'block text-[11px] uppercase tracking-[0.18em] text-mute mb-2';
  const errCls = 'mt-1 text-xs text-danger';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        {/* Avatar */}
        <div className="md:col-span-3">
          <p className={labelCls}>Photo</p>
          <div className="aspect-square w-full overflow-hidden bg-gulf">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-7xl text-bone/90">
                  {initials(currentName || initial.name)}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-4 w-full border border-line bg-bone py-2 text-xs uppercase tracking-[0.18em] hover:border-ink disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="mt-2 w-full text-xs text-mute hover:text-danger"
            >
              Remove photo
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
          />
        </div>

        {/* Fields */}
        <div className="space-y-6 md:col-span-9">
          <div>
            <label className={labelCls}>Name</label>
            <input {...register('name', { required: 'Name is required' })} className={inputCls} />
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input {...register('phone')} className={inputCls} placeholder="+971…" />
          </div>
          <div>
            <label className={labelCls}>Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Short bio shown on the public team page and listing details."
            />
          </div>
        </div>
      </div>

      {error && <div className="border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

      <div className="flex flex-col-reverse items-baseline gap-4 border-t border-line pt-6 md:flex-row md:justify-between">
        <Link href="/change-password" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          Change password →
        </Link>
        <div className="flex items-center gap-4">
          {savedAt && !isDirty && <span className="text-xs text-success">✓ Saved</span>}
          {isDirty && <span className="text-xs text-mute">Unsaved changes</span>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-bone hover:bg-gulf disabled:opacity-50"
            data-cursor={submitting ? 'saving' : 'save'}
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
