import { db } from './db';

const AREA_CODES: Record<string, string> = {
  'al-saadiyat-island': 'SD',
  'al-reem-island': 'RM',
  'corniche-road': 'CR',
  'yas-island': 'YS',
  'hudayriyat-island': 'HD',
  'ferrari-yas-bay': 'FR',
};

/**
 * Generate the next listing reference, e.g. "IGRE-SD-0042".
 * Falls back to "XX" if the area slug is unknown.
 */
export async function nextListingReference(areaSlug: string): Promise<string> {
  const code = AREA_CODES[areaSlug] ?? 'XX';
  const prefix = `IGRE-${code}-`;

  const last = await db.listing.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });

  const nextNum = last
    ? Number(last.reference.slice(prefix.length)) + 1
    : 1;

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}
