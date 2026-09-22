import { sql } from "@/lib/db";
import type { Profile, Project, SiteSettings } from "@/types/database";

// The Profile Card is a singleton — this always returns one row or null.
export async function getProfile(): Promise<Profile | null> {
  const rows = await sql`select * from profiles limit 1`;
  return (rows[0] as Profile) ?? null;
}

// Only published projects, in the order Mild set in Admin.
// This is the single source of truth for the public card wall —
// add a row in Neon (via the Admin UI) and it appears here automatically.
export async function getPublishedProjects(): Promise<Project[]> {
  const rows = await sql`
    select * from projects
    where status = 'published'
    order by display_order asc
  `;
  return rows as Project[];
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const rows = await sql`select * from site_settings limit 1`;
  return (rows[0] as SiteSettings) ?? null;
}

// ---------- Admin-only helpers (used behind the NextAuth-gated /admin routes) ----------

export async function getAllProjects(): Promise<Project[]> {
  const rows = await sql`select * from projects order by display_order asc`;
  return rows as Project[];
}

export async function upsertProfile(profile: Partial<Profile>) {
  const existing = await getProfile();
  if (existing) {
    const rows = await sql`
      update profiles set
        name = ${profile.name ?? existing.name},
        display_name = ${profile.display_name ?? existing.display_name},
        title = ${profile.title ?? existing.title},
        bio = ${profile.bio ?? existing.bio},
        profile_image = ${profile.profile_image ?? existing.profile_image},
        location = ${profile.location ?? existing.location}
      where id = ${existing.id}
      returning *
    `;
    return rows[0];
  }
  const rows = await sql`
    insert into profiles (name, display_name, title, bio, profile_image, location)
    values (${profile.name ?? ""}, ${profile.display_name ?? null}, ${profile.title ?? null},
            ${profile.bio ?? null}, ${profile.profile_image ?? null}, ${profile.location ?? null})
    returning *
  `;
  return rows[0];
}

export async function reorderProjects(orderedIds: string[]) {
  // Each id's new position is its index in the array — called after
  // a drag-and-drop reorder in Admin.
  await Promise.all(
    orderedIds.map(
      (id, index) => sql`update projects set display_order = ${index} where id = ${id}`
    )
  );
}
