'use client';

import { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  onChange: (next: string[]) => void;
  max?: number;
}

/**
 * Drag-to-reorder image grid with upload button.
 * The first image is the cover. Images are uploaded to /api/uploads which
 * returns { url } on success; the URL is appended to the list.
 */
export function ImageUploader({ images, onChange, max = 20 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > max) {
      setError(`Maximum ${max} images allowed`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/uploads', { method: 'POST', body: fd });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message || 'Upload failed');
        }
        const data = await res.json();
        next.push(data.url);
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const remove = (url: string) => onChange(images.filter((i) => i !== url));

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-mute">
          Images ({images.length}/{max})
        </p>
        <p className="text-[10px] text-mute">
          First image is the cover. Drag to reorder.
        </p>
      </div>

      {images.length > 0 && (
        <Reorder.Group
          values={images}
          onReorder={onChange}
          axis="y"
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
        >
          {images.map((url, i) => (
            <Reorder.Item
              key={url}
              value={url}
              className={cn(
                'group relative aspect-[4/3] overflow-hidden bg-sand cursor-grab active:cursor-grabbing',
                i === 0 && 'ring-2 ring-gold ring-offset-2 ring-offset-bone',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
              {i === 0 && (
                <span className="absolute left-2 top-2 bg-gold px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label="Remove"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center bg-bone/90 text-ink opacity-0 transition group-hover:opacity-100"
              >
                ×
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || images.length >= max}
          className="inline-flex items-center gap-2 border border-line bg-bone px-4 py-2 text-xs uppercase tracking-[0.18em] hover:border-ink disabled:opacity-50"
          data-cursor={uploading ? 'uploading' : 'add'}
        >
          {uploading ? 'Uploading…' : '+ Add images'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {error && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-danger">{error}</motion.span>}
      </div>
    </div>
  );
}
