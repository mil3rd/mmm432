# Mild — Know Me More

Single-page personal site: Hero → Profile Card + dynamic Project Cards → Contact.
Public content is fully database-driven. Stack: Next.js, TypeScript, Tailwind,
**Neon** (Postgres), **NextAuth** (admin login), **Vercel Blob** (image storage).

## What's in this pass

- `schema.sql` — plain Postgres schema for Neon (profiles, projects,
  project_images, social_links, site_settings).
- `lib/db.ts` — the Neon connection (tagged-template SQL, server-only).
- `lib/data.ts` — public read functions (`getProfile`, `getPublishedProjects`,
  `getSiteSettings`) plus the admin-only writes the editors will use
  (`upsertProfile`, `reorderProjects`, `getAllProjects`).
- `lib/auth.ts` + `middleware.ts` + `app/api/auth/[...nextauth]/route.ts` —
  single-admin login (you), every `/admin/*` route requires it.
- `app/api/upload/route.ts` — image upload endpoint (Vercel Blob), checked
  against your session server-side.
- `app/page.tsx` + `components/` — the public single-page site.

**Not built yet:** the actual `/admin` pages (login form, dashboard, the
Projects/Profile/Settings editors with the upload button and drag-to-reorder
UI). That's the next step — see the checklist below.

## Setup

1. **Database** — create a project at neon.tech, copy its connection string
   into `.env.local` as `DATABASE_URL`, then run `schema.sql` against it
   (Neon's SQL editor, or `psql "$DATABASE_URL" -f schema.sql`).
2. **Your login** — pick an email for `ADMIN_EMAIL`. Generate your password
   hash: `npm install`, then `npm run hash-password -- "your-password"`, and
   paste the output into `ADMIN_PASSWORD_HASH`. Set `NEXTAUTH_SECRET` to the
   output of `openssl rand -base64 32`.
3. **Image storage** — in your Vercel project, add a Blob store (Storage tab),
   then copy its token into `BLOB_READ_WRITE_TOKEN`.
4. Copy `.env.example` to `.env.local` and fill in all four sections.
5. Add one row to `profiles` by hand for now (until the Profile editor
   exists), so the homepage has something to render:
   ```sql
   insert into profiles (name, display_name, title, bio)
   values ('Phassaree Prasai', 'Mild', 'Multimedia Designer',
           'Creative designer exploring visual identity, motion, and visual storytelling.');
   ```
6. `npm run dev`, open `http://localhost:3000`.

## How to test what's here so far

- With zero rows in `projects`, the page still renders (empty state instead
  of breaking).
- Insert a project with `status = 'published'` → appears on refresh; set it
  to `'draft'` → disappears.
- A project with no `external_url` renders but isn't clickable.
- Visiting `/admin` right now redirects you to a login page that doesn't
  exist yet (next step below) — that redirect itself confirms the
  authentication gate is working.

## Next steps (in order)

1. **`/admin/login` page** — a simple email/password form calling NextAuth's
   `signIn("credentials", ...)`.
2. **`/admin` dashboard shell** — layout + nav (Dashboard, Projects, Profile,
   Settings), all behind the middleware you already have.
3. **Profile editor** — form bound to `upsertProfile`, with the image upload
   button wired to `/api/upload`.
4. **Projects list + editor** — table of all projects (`getAllProjects`),
   an add/edit form (title, slug, description, category, year, external URL,
   cover image upload, featured toggle, draft/publish), delete.
5. **Drag-and-drop reordering** — on the Projects list, calling
   `reorderProjects` on drop.
6. **Settings editor** — phone/email/Instagram, bound to `site_settings`.
7. Deploy to Vercel, connect the same Neon + Blob env vars there.

Tell me which of these to build next and I'll do that one.
