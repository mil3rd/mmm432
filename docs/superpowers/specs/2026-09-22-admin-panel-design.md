# Admin panel + Next.js restructure — design

**Date:** 2026-09-22
**Status:** approved, implementing

## Problem

The repo holds a complete public portfolio site, but every file sits flat at the
repo root while the imports inside them reference the real App Router layout
(`@/lib/db`, `@/components/Hero`, `@/types/database`). Two files carry GitHub's
duplicate-name suffix: `page (1).tsx` and `route (1).ts`. The project does not
build in its current state.

Separately, the `/admin` section the site is designed around does not exist. The
NextAuth config, the middleware gate, the upload endpoint and the admin-only data
helpers are all written and waiting; nothing calls them.

## Scope

1. Move every file to its intended Next.js path (`git mv`, history preserved).
2. Build the full `/admin` section.
3. Wire the real Neon database, create the schema, seed a starter profile.

Out of scope: redesigning the public page, adding a test framework, any
Vercel-specific config (the site is imported through Vercel's dashboard).

## Approach

**Server Actions over a REST API.** `lib/data.ts` is already a set of server
functions; admin forms post straight to `"use server"` handlers in
`lib/actions.ts`. No JSON endpoints exist purely for our own pages to call. The
sole exception is image upload, which stays the existing route handler at
`/api/upload` because it takes a `multipart/form-data` POST from a file picker.

**Arrows over drag-and-drop for reordering.** The README proposed drag-and-drop.
Up/down buttons calling `reorderProjects` need no library, work on touch, and are
keyboard-accessible by default. For a wall of ~8 cards the tradeoff favours the
simpler control.

**Defence in depth on auth.** `middleware.ts` gates `/admin/*`, and every server
action independently calls `getServerSession` before touching the database.
Middleware alone is not treated as the security boundary.

## Target structure

    app/layout.tsx, globals.css, page.tsx
    app/api/auth/[...nextauth]/route.ts
    app/api/upload/route.ts
    app/admin/{layout,page}.tsx
    app/admin/login/page.tsx
    app/admin/profile/page.tsx
    app/admin/projects/{page,new/page,[id]/page}.tsx
    app/admin/settings/page.tsx
    components/{Hero,ProfileCard,ProjectCard,ProjectWall,Contact}.tsx
    components/admin/{AdminNav,ImageUploadField,SubmitButton,...}.tsx
    lib/{db,data,auth,actions}.ts
    types/database.ts
    scripts/hash-password.js
    root: middleware.ts, configs, schema.sql, README.md, .gitignore, .env.example

## Defects fixed in passing

- No `.gitignore` — `node_modules/` and `.env.local` would be committed. The
  `.env.local` case leaks a live database credential, so this is the priority fix.
- `next lint` is declared as a script but eslint is absent from devDependencies.
- `middleware.ts` matches `/admin/:path*`, which includes `/admin/login`. If
  NextAuth's middleware does not self-exclude its own sign-in page, an
  unauthenticated visitor redirects to login forever. Verified and pinned
  explicitly.

## Data layer additions

`lib/data.ts` gains the writes the admin needs and currently lacks:
`getProjectById`, `getProjectBySlug`, `createProject`, `updateProject`,
`deleteProject`, `upsertSiteSettings`, plus `project_images` helpers
(`getProjectImages`, `addProjectImage`, `deleteProjectImage`).

Every mutation calls `revalidatePath("/")` so the public page reflects the edit
immediately.

## Verification

No test framework exists and adding one is outside what was asked. The gate is:

1. `npm install` clean.
2. `npm run build` passes — this typechecks every file touched.
3. A connectivity script confirms all five tables exist in Neon.
4. `npm run dev`, then the login → edit → upload → publish flow walked by hand.

Results are reported as observed, including anything that fails.
