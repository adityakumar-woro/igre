import { NextRequest } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { uploadDirPath } from '@/lib/upload';

interface Ctx { params: Promise<{ name: string }> }

const MIME_BY_EXT: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

/**
 * Serves user-uploaded files from the persistent disk in production.
 * In dev these are served directly by Next from /public/uploads, so this
 * route is mostly a no-op in dev — but it's safe to hit either way.
 *
 * Path-traversal guard: any name containing slashes or `..` is rejected.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { name } = await params;

  if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) {
    return new Response('Bad request', { status: 400 });
  }

  const file = path.join(uploadDirPath(), name);

  try {
    const s = await stat(file);
    if (!s.isFile()) return new Response('Not found', { status: 404 });

    const ext = path.extname(name).toLowerCase();
    const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream';

    const buf = await readFile(file);
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(buf.length),
        // 1 hour cache; tweak if you want stricter or no caching.
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
