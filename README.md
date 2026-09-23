# Mild — Know Me More

Single-page personal site: Hero → Profile Card + dynamic Project Cards → Contact,
with a password-protected admin area for editing everything without touching code.

Stack: Next.js 14 (App Router), TypeScript, Tailwind, **Neon** (Postgres),
**NextAuth** (admin login), **Vercel Blob** (image storage).

## Setup

You need Node 18 or newer.

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

- **`DATABASE_URL`** — Neon dashboard → your project → Connection string (the
  pooled one).
- **`NEXTAUTH_SECRET`** — generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- **`NEXTAUTH_URL`** — `http://localhost:3000` locally; your real domain on Vercel.
- **`ADMIN_USERNAME`** — whatever name you want to log in with. It is a
  plain username, not an email address.
- **`ADMIN_PASSWORD_HASH`** — generate with:
  ```bash
  npm run hash-password -- "your-password"
  ```
  The script prints two versions. Use the **escaped** one in `.env.local` and the
  **raw** one in the Vercel dashboard. This matters — see the warning below.
- **`BLOBv1_READ_WRITE_TOKEN`** — Vercel dashboard → Storage → Blob → the store
  connected to this project (prefix `BLOBv1`) → copy the token from its
  `.env.local` tab. The store is **private**: uploads are stored with private
  access and the site serves them through `/api/image/…`, which is the value
  saved in the database. Everything works without
  this except uploading images.

> **The `$` signs in the password hash must be escaped in `.env.local`.**
> A bcrypt hash looks like `$2a$10$…`, and the library Next uses to read `.env`
> files treats `$name` as a variable to substitute. An unescaped hash is
> silently chopped down to a fragment and every login fails with no error that
> points at the cause. Writing it as `"\$2a\$10\$…"` is what makes it survive.
> In the Vercel dashboard there is no `.env` parsing, so paste the raw hash there.

### 3. Database

```bash
npm run db:setup   # creates the tables from schema.sql
npm run db:seed    # adds a starter profile row so the homepage renders
npm run db:check   # lists the tables and row counts
```

`db:setup` and `db:seed` are both safe to re-run.

### 4. Run it

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin

> If the site ever renders with no styling at all, delete the `.next` folder and
> restart. It means a production build and the dev server got mixed up in there.

## Deploying

Import the repo at vercel.com — no config files needed, Vercel detects Next.js
on its own. Then in the project's Settings → Environment Variables, add the same
five values from `.env.local` (raw hash, not escaped), plus the Blob token.

`DATABASE_URL` has to be set for the build itself, not just at runtime — the
homepage is prerendered at build time and reads from the database.

## Project layout

```
app/
  layout.tsx, globals.css, page.tsx   the public site
  admin/
    login/page.tsx                    sign-in form (outside the auth guard)
    (protected)/                      everything behind the login
      layout.tsx                      session check + nav
      page.tsx                        dashboard
      projects/                       list, new, [id] editor
      profile/page.tsx
      settings/page.tsx
  api/
    auth/[...nextauth]/route.ts       NextAuth handler
    upload/route.ts                   upload token handshake → Vercel Blob
    image/[...path]/route.ts          serves images from the private store
components/            public site components
components/admin/      admin forms, image upload, nav
lib/
  db.ts                Neon connection (server-only)
  data.ts              all database reads and writes
  auth.ts              NextAuth config (single admin account)
  actions.ts           server actions the admin forms post to
types/database.ts      row types
scripts/               hash-password, db setup/seed/check
middleware.ts          gates /admin/*
schema.sql             the database schema
```

`(protected)` is a route group: it decides which pages get the auth layout
without appearing in the URL. `/admin/login` sits outside it deliberately — if
it were inside, the login page would redirect to itself forever.

## How the admin works

- **Dashboard** — counts, plus a to-do list of anything that would make the
  public page look unfinished.
- **Projects** — every project, in site order. `↑`/`↓` reorder, the status chip
  toggles draft/published in one click, `Edit` opens the full editor.
- **Project editor** — all fields, cover image upload, a gallery for extra
  images, and delete (two clicks).
- **Profile** — the card on the homepage, including the photo.
- **Settings** — phone, email, Instagram. Blank fields are hidden on the site.

Saving anything refreshes the public page immediately.

## Security notes

- One account, defined by two env vars. There's no user table and no signup.
- The crosshair at the top right of the homepage links to `/admin`. It's an
  unadvertised entrance, not a security measure — the login still gates it.
- `/admin/*` is gated by `middleware.ts`, and the protected layout and every
  server action check the session again independently. Middleware is a
  convenience, not the boundary.
- Never commit `.env.local` — it holds the database password. `.gitignore`
  already covers it.

## Changing the login

```bash
npm run hash-password -- "new-password"
```

Paste the escaped line into `.env.local` (and the raw hash into Vercel), and
edit `ADMIN_USERNAME` beside it. Restart `npm run dev` — env vars are read at
boot, so a running server keeps the old credentials.

## Known follow-ups

- **Next 14 is end-of-life.** The installed 14.2.35 has the fix for the
  middleware auth-bypass CVE, but the remaining `npm audit` advisories are only
  fixed in 15.5.x. Upgrading means Next 15 + React 19 and re-testing NextAuth.
- Reordering uses buttons rather than drag-and-drop.
- `social_links` has a table and a read function but no editor yet; nothing
  renders it.
