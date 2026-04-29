# NEXT_STEPS

Roadmap for taking IGRE from runnable foundation → production launch.

## Phase 2 — Manager dashboard (build next)
- Listings CRUD
  - `/dashboard/listings` — TanStack Table with filters & search over agent's own listings
  - `/dashboard/listings/new` — multi-step form: basics → media (drag-drop upload via `/api/uploads`) → location → review → submit
  - `/dashboard/listings/[id]/edit` — same form pre-filled
  - Submit-for-approval action (`DRAFT` → `PENDING`)
- Leads kanban (`/dashboard/leads`)
  - Drag-and-drop columns: `NEW · CONTACTED · VIEWING_SCHEDULED · NEGOTIATING · WON / LOST`
  - Lead detail page with activity timeline
- Enquiries inbox (`/dashboard/enquiries`)
  - Convert enquiry → lead with one click
- Viewings calendar (`/dashboard/viewings`)
  - Month + week views
- Profile editor (`/dashboard/profile`)

## Phase 3 — Admin panel
- KPI dashboard with Recharts (listings by status, monthly enquiries, top areas, top agents)
- Approval queue (`/admin/listings/pending`)
- Users CRUD (`/admin/users`) with role assignment + reset-password action
- Areas editor (`/admin/areas`) — edit content, hero image, starting prices inline
- Leads pipeline view across all agents — reassign action
- All-enquiries inbox with assign-to-agent
- Audit log viewer with filters
- Site settings (`/admin/settings`) — RERA license, social links, footer copyright

## Phase 4 — Polish & launch prep
- Forgot/reset-password flow with token table + Resend email
- Login lockout: 5 fails / 15 min IP-bucketed (currently TODO in `lib/auth.ts`)
- Notifications system: in-app inbox + email digest
- Image upload UI + S3/R2 swap (TODO in `lib/upload.ts`)
- Replace placeholder Unsplash photography with real shots — every `data-placeholder="true"` is a swap candidate
- Real portrait photography for the team
- Add real RERA license number to `SiteSetting`
- Arabic translations + RTL routes (`/ar/*`)
- WhatsApp Business API for inbound message threading
- Google Analytics 4 + Meta Pixel (gate behind cookie consent)
- Consent banner

## Operational
- Get the actual office building photos — the spec mentions [building photos](https://maps.app.goo.gl/o4sWwiLY4pLzovCw5); embed those on `/contact`
- Nightly DB backup cron (one-liner in README)
- Uptime monitor (Better Stack, UptimeRobot)
- Error monitoring — Sentry on the Next.js app
- Status page — overkill for now, but easy later

## When to outgrow SQLite
SQLite handles this app comfortably until:
- More than ~50 concurrent writes/sec, or
- Multi-instance deployment (no shared file system)

At that point: switch `provider = "postgresql"` in `prisma/schema.prisma`, run a one-time data import, point `DATABASE_URL` at managed Postgres (Neon, Railway, Supabase), and redeploy. No application code changes required.

## When to migrate listings to a CMS
If listings grow past ~200 and the team starts wanting richer content (blog posts about each tower, market reports, area guides), consider Sanity or Strapi for the *content* and keep the operational data (leads, enquiries, viewings, users) in Prisma. The schema is already split cleanly enough to make this a low-pain change.

## Cloudflare R2 / S3 for uploads
At ~1000 photos the local FS approach starts being painful — backup, distribution, CDN. Swap to R2 (cheaper than S3 for image-heavy use). Single change in `lib/upload.ts`, plus the bucket added to `next.config.mjs` `images.remotePatterns`.
