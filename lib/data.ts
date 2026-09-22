import { sql } from "@/lib/db";
import type {
  Profile,
  Project,
  ProjectImage,
  SiteSettings,
  SocialLink,
} from "@/types/database";

// ---------- PROFILE ----------

// The Profile Card is a singleton — this always returns one row or null.
export async function getProfile(): Promise<Profile | null> {
  const rows = await sql`select * from profiles limit 1`;
  return (rows[0] as Profile) ?? null;
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
    return rows[0] as Profile;
  }
  const rows = await sql`
    insert into profiles (name, display_name, title, bio, profile_image, location)
    values (${profile.name ?? ""}, ${profile.display_name ?? null}, ${profile.title ?? null},
            ${profile.bio ?? null}, ${profile.profile_image ?? null}, ${profile.location ?? null})
    returning *
  `;
  return rows[0] as Profile;
}

// ---------- PROJECTS (public) ----------

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

// ---------- PROJECTS (admin) ----------

export async function getAllProjects(): Promise<Project[]> {
  const rows = await sql`select * from projects order by display_order asc`;
  return rows as Project[];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const rows = await sql`select * from projects where id = ${id}`;
  return (rows[0] as Project) ?? null;
}

// Slugs are unique in the schema, so a clash is a constraint violation
// rather than a silent overwrite. The caller checks with this first and
// shows a form error instead of letting Postgres throw.
export async function isSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const rows = exceptId
    ? await sql`select 1 from projects where slug = ${slug} and id <> ${exceptId} limit 1`
    : await sql`select 1 from projects where slug = ${slug} limit 1`;
  return rows.length > 0;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  // New projects land at the end of the wall.
  const [{ next_order }] = (await sql`
    select coalesce(max(display_order) + 1, 0) as next_order from projects
  `) as { next_order: number }[];

  const rows = await sql`
    insert into projects (
      title, slug, description, category, year, role, responsibilities,
      tools, skills, cover_image, external_url, external_url_label,
      is_featured, status, display_order
    ) values (
      ${project.title ?? ""}, ${project.slug ?? ""}, ${project.description ?? null},
      ${project.category ?? null}, ${project.year ?? null}, ${project.role ?? null},
      ${project.responsibilities ?? null}, ${project.tools ?? null}, ${project.skills ?? null},
      ${project.cover_image ?? null}, ${project.external_url ?? null},
      ${project.external_url_label ?? null}, ${project.is_featured ?? false},
      ${project.status ?? "draft"}, ${next_order}
    )
    returning *
  `;
  return rows[0] as Project;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
  const existing = await getProjectById(id);
  if (!existing) return null;

  const rows = await sql`
    update projects set
      title = ${project.title ?? existing.title},
      slug = ${project.slug ?? existing.slug},
      description = ${project.description ?? existing.description},
      category = ${project.category ?? existing.category},
      year = ${project.year ?? existing.year},
      role = ${project.role ?? existing.role},
      responsibilities = ${project.responsibilities ?? existing.responsibilities},
      tools = ${project.tools ?? existing.tools},
      skills = ${project.skills ?? existing.skills},
      cover_image = ${project.cover_image ?? existing.cover_image},
      external_url = ${project.external_url ?? existing.external_url},
      external_url_label = ${project.external_url_label ?? existing.external_url_label},
      is_featured = ${project.is_featured ?? existing.is_featured},
      status = ${project.status ?? existing.status}
    where id = ${id}
    returning *
  `;
  return rows[0] as Project;
}

export async function deleteProject(id: string) {
  // project_images rows go with it — the schema cascades on delete.
  await sql`delete from projects where id = ${id}`;
}

export async function setProjectStatus(id: string, status: Project["status"]) {
  await sql`update projects set status = ${status} where id = ${id}`;
}

export async function reorderProjects(orderedIds: string[]) {
  // Each id's new position is its index in the array — called after
  // a reorder in Admin.
  await Promise.all(
    orderedIds.map(
      (id, index) => sql`update projects set display_order = ${index} where id = ${id}`
    )
  );
}

// ---------- PROJECT IMAGES (gallery) ----------

export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
  const rows = await sql`
    select * from project_images
    where project_id = ${projectId}
    order by display_order asc
  `;
  return rows as ProjectImage[];
}

export async function addProjectImage(projectId: string, imageUrl: string) {
  const [{ next_order }] = (await sql`
    select coalesce(max(display_order) + 1, 0) as next_order
    from project_images where project_id = ${projectId}
  `) as { next_order: number }[];

  await sql`
    insert into project_images (project_id, image_url, display_order)
    values (${projectId}, ${imageUrl}, ${next_order})
  `;
}

export async function deleteProjectImage(id: string) {
  await sql`delete from project_images where id = ${id}`;
}

// ---------- SITE SETTINGS ----------

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const rows = await sql`select * from site_settings limit 1`;
  return (rows[0] as SiteSettings) ?? null;
}

export async function upsertSiteSettings(settings: Partial<SiteSettings>) {
  const existing = await getSiteSettings();
  if (existing) {
    const rows = await sql`
      update site_settings set
        phone = ${settings.phone ?? existing.phone},
        email = ${settings.email ?? existing.email},
        instagram = ${settings.instagram ?? existing.instagram}
      where id = ${existing.id}
      returning *
    `;
    return rows[0] as SiteSettings;
  }
  const rows = await sql`
    insert into site_settings (phone, email, instagram)
    values (${settings.phone ?? null}, ${settings.email ?? null}, ${settings.instagram ?? null})
    returning *
  `;
  return rows[0] as SiteSettings;
}

// ---------- SOCIAL LINKS ----------

export async function getSocialLinks(): Promise<SocialLink[]> {
  const rows = await sql`select * from social_links order by display_order asc`;
  return rows as SocialLink[];
}
