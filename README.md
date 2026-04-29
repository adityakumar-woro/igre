# IGRE — Real Estate Platform

A full-stack Next.js application for IGRE (Real Estate Brokers, Abu Dhabi). Public marketing site with WebGL/Lenis editorial polish, plus role-based panels for users, agents, and admins.

> **Status:** Phase 1 (Foundation). The public site, listings, auth, RBAC, schema, and seed are runnable. The agent and admin panels are scaffolded with overview pages — full CRUD comes in Phases 2 & 3.

---

## Quick start

```bash
# Requires Node 20+
npm install              # also runs `prisma generate`
cp .env.example .env     # then edit NEXTAUTH_SECRET (see below)
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Generate a secret

```bash
# Linux/macOS:
openssl rand -base64 32

# Windows (PowerShell):
[Convert]::ToBase64String((1..32 | %{ Get-Random -Maximum 256 }))
```
Paste into `NEXTAUTH_SECRET` in `.env`.

---

## Seeded accounts

All staff accounts use the password from `.env`'s `SEED_DEFAULT_PASSWORD` (default: `IGRE@2026`) and **must change it on first login**.

| Email | Role | Default password |
|---|---|---|
| `igre.kaiser@gmail.com` | ADMIN | `IGRE@2026` |
| `igre.asad@gmail.com` | MANAGER | `IGRE@2026` |
| `faisalvpz2777@gmail.com` | MANAGER | `IGRE@2026` |
| `ashikuzzamanarman@gmail.com` | MANAGER | `IGRE@2026` |
| `demo@igre.ae` | USER (public-user demo, no force change) | `Demo@2026` |

After login you'll be redirected to `/change-password` if `forcePasswordChange` is true.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on `localhost:3000` |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Run the built server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Apply pending migrations in dev |
| `npm run db:push` | Push schema without a migration (handy for first-run / Windows) |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:reset` | `migrate reset --force` + reseed |
| `npm run db:studio` | Prisma Studio at `localhost:5555` |

---

## Architecture

- **Single Next.js 15 app** (App Router, Server Components, Server Actions). No separate Express server.
- **SQLite** via `better-sqlite3`, file at `prisma/igre.db`.
- **Prisma 6** with the `driverAdapters` preview feature.
- **Auth.js v5 (next-auth beta)** — credentials provider, JWT sessions, bcrypt cost 12.
- **RBAC** via `middleware.ts` (Edge) + `lib/rbac.ts` (server helpers).
  - `/admin/*` → `ADMIN`
  - `/dashboard/*` → `MANAGER` or `ADMIN`
  - `/my/*` → any authenticated user
  - Other → public
- **Editorial design**: Fraunces (display) + Inter + IBM Plex Sans Arabic (RTL-ready), Tailwind 4 with the `Desert Pearl` palette as CSS variables.
- **Motion**: Lenis smooth scroll, Framer Motion reveals, custom 2-layer cursor, magnetic buttons, R3F + custom GLSL shader for the hero.
- **Accessibility**: `prefers-reduced-motion` disables WebGL, smooth scroll, and reveals; gold focus ring; semantic landmarks.

---

## Project tree

```
app/
  (auth)/                 # login, register
  (public)/               # homepage + marketing pages
  admin/                  # ADMIN overview (Phase 3 expands)
  api/                    # auth, register, change-password, listings, enquiries, favourites, viewing-requests
  change-password/
  dashboard/              # MANAGER overview (Phase 2 expands)
  my/                     # USER panel — favourites, enquiries, viewings, profile
  403/                    # custom 403
  layout.tsx              # SmoothScroll + CustomCursor + SessionProvider
  globals.css
  not-found.tsx           # custom 404
  robots.ts
  sitemap.ts
components/
  auth/                   # LoginForm, RegisterForm, ChangePasswordForm
  motion/                 # SmoothScroll, CustomCursor, RevealText, RevealImage, MagneticButton, HeroCanvas (WebGL)
  public/                 # Hero, AreaIndex, FeaturedListing, AreasGrid, WhyIgre, TeamGrid, QuietCTA, ListingCard, ListingFilters, ListingGallery, ListingEnquiryForm, FavouriteToggle, ContactForm
  shared/                 # Header, Footer, Logo, SessionProvider
lib/
  auth.ts                 # Auth.js config + handlers
  audit.ts                # logAudit helper
  db.ts                   # Prisma singleton
  email.ts                # Resend wrapper (silent if no key)
  format.ts               # AED, sqft, date helpers
  ratelimit.ts            # in-memory sliding window
  rbac.ts                 # requireRole / requireAuth / errorResponse
  reference.ts            # IGRE-AR-0042 generator
  slugify.ts
  types.ts                # Role / ListingType / etc string-unions
  upload.ts               # local FS uploads
  utils.ts                # cn, safeJsonArray
  validations/            # Zod schemas: auth, listing, enquiry, user
prisma/
  schema.prisma
  seed.ts
public/
  uploads/                # local image storage
middleware.ts             # RBAC routing
next.config.mjs           # security headers, image domains
tailwind.config.ts
.env.example
```

---

## Common operations

### Add a new area
1. `npx prisma studio` → open Areas → add a row, or
2. Edit `prisma/seed.ts` and add to the `prisma.area.create({...})` block, then `npm run db:reset`.
3. Reference codes used by `lib/reference.ts` live at the top of that file — add a new entry (e.g. `'al-maryah-island': 'MA'`).

### Swap dummy images for real ones
Every placeholder `<img>` is marked with `data-placeholder="true"` and a nearby `<!-- TODO: replace -->` comment. Search the codebase for `data-placeholder` to find them all. Drop your real images in `/public/uploads/` (or upload via the API) and replace the URLs in seed/Listing rows.

### Enable Arabic
The IBM Plex Sans Arabic font is already loaded. To turn on RTL:
1. Translate the strings in `components/shared/Header.tsx`, `Footer.tsx`, the homepage section components, and the page metadata.
2. Add a language switcher (the footer has a stub).
3. Set `<html dir="rtl">` for `/ar/*` routes — easiest via a `[lang]` segment in `app/`.

### Swap from local file uploads to S3 / Cloudflare R2
- Look at `lib/upload.ts` — single `saveUpload()` function.
- Replace the `writeFile` block with `S3Client.send(new PutObjectCommand(...))` (AWS) or the equivalent R2 SDK.
- Return the resulting public URL instead of `/uploads/...`.
- Add the bucket to `next.config.mjs` `images.remotePatterns`.

### Backups
SQLite + `cp` is enough for nightly:
```bash
mkdir -p backups
cp prisma/igre.db backups/igre-$(date +%F).db
```
Add to crontab on the production host (every host has a different cron mechanism — Linux `crontab -e`, Windows Task Scheduler, etc).

---

## Production deployment — Railway

The repo ships with a [`railway.json`](./railway.json) so Railway runs the production bootstrap script (which applies migrations and seeds the empty DB) instead of the default `npm start`.

**Plan note:** Railway's [Hobby plan is $5/month](https://railway.com/pricing) and includes 5 GB of volume storage — more than enough for SQLite + user uploads.

### One-time setup

1. **Push to GitHub** (already done if you're reading this in the deployed repo).

2. **Sign in to [railway.com](https://railway.com)** → **New Project** → **Deploy from GitHub repo** → pick `adityakumar-woro/igre`. Railway detects Next.js via Nixpacks and starts the first build immediately.

3. **Add a volume** for the SQLite database and uploads. In the project, click your service → **Settings** → **Volumes** → **Add Volume**:

   | Field | Value |
   |---|---|
   | Mount path | `/var/data` |
   | Size | 1 GB (plenty) |

4. **Set environment variables** (Service → **Variables** → **Raw Editor**, paste this):

   ```env
   DATABASE_URL=file:/var/data/igre.db
   UPLOAD_DIR=/var/data/uploads
   NEXTAUTH_SECRET=<run `openssl rand -base64 32` and paste output>
   NEXTAUTH_URL=https://<your-railway-domain>.up.railway.app
   AUTH_TRUST_HOST=true
   NEXT_PUBLIC_WHATSAPP_NUMBER=971581005220
   MAX_UPLOAD_SIZE_MB=5
   RATE_LIMIT_REQUESTS=10
   RATE_LIMIT_WINDOW_MS=60000
   SEED_DEFAULT_PASSWORD=<pick a password — first-login pw for the 4 staff>
   EMAIL_FROM=IGRE <noreply@igre.ae>
   ```

   For `NEXTAUTH_URL`, Railway gives you a domain immediately — get it from **Settings → Networking → Generate Domain**, then paste it back into this variable.

5. **Redeploy.** Trigger a redeploy from the Railway UI (or just push another commit). The deploy log will show:
   ```
   IGRE — production bootstrap starting
   > npx prisma migrate deploy
   DB empty — running seed (one-time)
   Starting Next.js server
   ```

6. **Test.** Visit your Railway URL and sign in as `igre.kaiser@gmail.com` / `<SEED_DEFAULT_PASSWORD>`. You'll be redirected to `/change-password` (force-change flag). Set a real password.

### Subsequent deploys

`git push` to `main`. Railway rebuilds, the bootstrap script applies any new migrations, and **skips re-seeding** because the DB already has data.

### Custom domain on Railway

Railway → service → **Settings** → **Networking** → **Custom Domain**. Add a CNAME record per the instructions. Then update `NEXTAUTH_URL` to the new domain and redeploy.

---

## Production deployment — Render (alternative)

The repo ships with a [`render.yaml`](./render.yaml) blueprint. One click after you connect the repo provisions: the web service, a 1 GB persistent disk mounted at `/var/data` (holds the SQLite DB + user uploads), and all the env vars except a few secrets you set yourself.

**Plan note:** Render's free tier doesn't support persistent disks. Cheapest plan that works is **Starter — $7/month**.

### One-time setup

1. **Push the repo to GitHub** (or GitLab / Bitbucket — Render supports all three).
   ```bash
   git remote add origin git@github.com:<you>/igre.git
   git push -u origin main
   ```

2. **Sign in to [render.com](https://render.com)** → **New** → **Blueprint** → connect the repo.
   Render will detect `render.yaml` and show you the resources it's about to create. Confirm.

3. **Set the three secret env vars** Render couldn't fill in automatically (the blueprint marks them `sync: false`):

   | Variable | What | How |
   |---|---|---|
   | `NEXTAUTH_SECRET` | Auth.js JWT signing key | `openssl rand -base64 32`, paste the result |
   | `NEXTAUTH_URL` | Your Render URL | Once Render tells you the service URL (e.g. `https://igre.onrender.com`), paste it back |
   | `SEED_DEFAULT_PASSWORD` | First-login password for the 4 staff accounts | Pick something sensible (default in dev: `IGRE@2026`) |

4. **Deploy.** Render runs `npm ci && npm run build`, mounts the disk, then on first boot `scripts/start.js` runs `prisma migrate deploy` and (since the DB is empty) seeds it once. The 5 seeded accounts work immediately.

5. **Test.** Visit your Render URL and sign in as `igre.kaiser@gmail.com` / `<your seed password>`.

### Subsequent deploys

`git push` to the connected branch. Render rebuilds automatically. The bootstrap script applies any new migrations and **skips re-seeding** because the DB is no longer empty.

### What's on the persistent disk vs in the build

| Path | Where | Survives redeploy? |
|---|---|---|
| `prisma/igre.db` (`DATABASE_URL=file:/var/data/igre.db`) | Persistent disk | ✅ Yes |
| User-uploaded photos via `/api/uploads` (`UPLOAD_DIR=/var/data/uploads`) | Persistent disk | ✅ Yes |
| `public/brand/logo.png`, `public/team/*.png` | Build artifact (in git) | ✅ Yes |
| Anything else under `public/uploads/` (legacy) | Ephemeral | ❌ No |

### Custom domain

Render → service → **Settings** → **Custom Domain**. Add your DNS record as instructed, then update `NEXTAUTH_URL` to the new URL and redeploy.

### Backup strategy

Render's persistent disk is durable but you should still back the SQLite file up nightly. Easiest path: a Render **cron job** that copies the DB to another location (S3, Cloudflare R2, or a different bucket).

```bash
# Cron job command
cp /var/data/igre.db /var/data/backups/igre-$(date +%F).db
```

For real disaster-recovery, mount an S3 destination and `aws s3 cp` the snapshot.

### Outgrowing SQLite

If you hit ~50 concurrent writes/sec or want multi-instance horizontal scaling, switch to Postgres: change the `provider` in `schema.prisma`, set `DATABASE_URL` to a Postgres URL (Render has managed Postgres), run `prisma migrate deploy`, and import the data. No application code changes required.

---

## Other hosts

If you'd rather not use Render, the same code runs on:

- **Fly.io** — has a free 3 GB volume tier; needs a `fly.toml` (similar to `render.yaml`)
- **Railway** — also has a Volume primitive; build/start commands match what's in `render.yaml`
- **Any VPS** (DigitalOcean / Hetzner / Linode) — clone, `npm ci`, set env vars, `npm run build`, `npm run start:prod` behind a process manager (PM2 / systemd) and a TLS terminator (Caddy / Nginx)

---

## Security

- Passwords: bcrypt cost 12.
- All input validated with **Zod**.
- All DB writes through Prisma (no string-concat SQL).
- Rate limit on `/api/auth/register` and `/api/enquiries` (10 req/min/IP, in-memory).
- Audit log on every mutation.
- Security headers in `next.config.mjs`.
- Cookies: httpOnly, sameSite=lax, secure in production.
- Image upload: MIME-checked, 5MB cap, UUID-renamed.
- React escapes by default; we never use `dangerouslySetInnerHTML` on user input (only on JSON-LD strings we generate ourselves).

For production: swap the in-memory rate limiter for **Upstash Redis** (`lib/ratelimit.ts` has a TODO comment).

---

## What's runnable today (Phase 1)

✅ Editorial homepage with WebGL hero, scroll storytelling, Lenis, custom cursor, magnetic CTAs
✅ Listings index with filters, paginated
✅ Single listing page with sticky details, gallery, enquiry form, JSON-LD
✅ All six area pages
✅ About / Team / Services / Contact / Collaborate
✅ Login / Register / Change password / 403 / 404
✅ USER panel: favourites, enquiries, viewings, profile
✅ MANAGER overview dashboard (read-only)
✅ ADMIN overview dashboard (read-only)
✅ API: auth (Auth.js), register, change-password, listings (GET), enquiries (POST), viewing-requests (POST), favourites (toggle)
✅ Audit log on all mutations
✅ Rate limiting on public endpoints
✅ SEO: metadata, robots.txt, sitemap.xml, JSON-LD on home + listing pages

See [`NEXT_STEPS.md`](./NEXT_STEPS.md) for what's next.

---

## License

Private. © IGRE Real Estate Brokers.
