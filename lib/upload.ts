// User-uploaded files (listing photos, agent avatars, etc.)
//
// In dev they live in `public/uploads/` so Next serves them directly.
// In prod (Render) `public/` is part of the build artifact and gets wiped on
// every redeploy — so we write to the persistent disk path instead and serve
// the files back via /api/uploads/[name] (see app/api/uploads/[name]/route.ts).
//
// Set UPLOAD_DIR=/var/data/uploads in production. The /api/uploads endpoint
// returns paths under /api/uploads/<filename>, so URLs work the same in both
// environments.
//
// TODO: swap to S3 / Cloudflare R2 for multi-instance deploys.

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

const MAX_BYTES = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5) * 1024 * 1024;

function uploadDir(): string {
  // In production (e.g. on Render) point this at the persistent disk:
  //   UPLOAD_DIR=/var/data/uploads
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  // In dev, fall back to public/uploads so Next serves directly.
  return path.join(process.cwd(), 'public', 'uploads');
}

/**
 * URL the browser uses to fetch a saved upload.
 * Dev: /uploads/<file>           (served by Next from public/)
 * Prod: /api/uploads/<file>      (served by app/api/uploads/[name])
 */
function publicUrlFor(filename: string): string {
  if (process.env.UPLOAD_DIR) return `/api/uploads/${filename}`;
  return `/uploads/${filename}`;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mime: string;
}

export async function saveUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large. Max ${MAX_BYTES / 1024 / 1024}MB.`);
  }

  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
  const id = crypto.randomUUID();
  const filename = `${id}${ext}`;

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    url: publicUrlFor(filename),
    filename,
    size: file.size,
    mime: file.type,
  };
}

export function uploadDirPath(): string {
  return uploadDir();
}
