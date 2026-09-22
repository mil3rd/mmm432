"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as data from "@/lib/data";
import type { Project } from "@/types/database";

// Every action re-checks the session itself. middleware.ts already gates
// /admin, but middleware is a convenience layer — the database write is the
// thing that actually needs protecting, so the check lives next to it too.
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Not signed in");
}

export type ActionResult = { error?: string };

// Forms submit every field, so a blank input arrives as "". That's treated as
// "the user cleared this", which is different from a field that was never sent.
function text(form: FormData, key: string): string {
  return (form.get(key) as string | null)?.trim() ?? "";
}

function list(form: FormData, key: string): string[] {
  return text(form, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Both public page and admin views are cached; a write has to clear both or
// the edit appears to have silently failed.
function revalidateAll(projectId?: string) {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  if (projectId) revalidatePath(`/admin/projects/${projectId}`);
}

// ---------- PROFILE ----------

export async function saveProfile(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const name = text(form, "name");
  if (!name) return { error: "Name is required — it's the one field the homepage can't render without." };

  await data.upsertProfile({
    name,
    display_name: text(form, "display_name"),
    title: text(form, "title"),
    bio: text(form, "bio"),
    location: text(form, "location"),
    profile_image: text(form, "profile_image"),
  });

  revalidateAll();
  return {};
}

// ---------- PROJECTS ----------

export async function saveProject(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = text(form, "id");
  const title = text(form, "title");
  if (!title) return { error: "Title is required." };

  // An empty slug is derived from the title so this isn't a field anyone has
  // to think about, but a typed one always wins.
  const slug = slugify(text(form, "slug") || title);
  if (!slug) return { error: "Could not build a web address from that title — add a slug manually." };

  if (await data.isSlugTaken(slug, id || undefined)) {
    return { error: `Another project already uses the address "${slug}". Pick a different one.` };
  }

  const fields: Partial<Project> = {
    title,
    slug,
    description: text(form, "description"),
    category: text(form, "category"),
    year: text(form, "year"),
    role: text(form, "role"),
    responsibilities: text(form, "responsibilities"),
    tools: list(form, "tools"),
    skills: list(form, "skills"),
    cover_image: text(form, "cover_image"),
    external_url: text(form, "external_url"),
    external_url_label: text(form, "external_url_label"),
    is_featured: form.get("is_featured") === "on",
    status: form.get("status") === "published" ? "published" : "draft",
  };

  let projectId = id;
  if (id) {
    const updated = await data.updateProject(id, fields);
    if (!updated) return { error: "That project no longer exists — it may have been deleted in another tab." };
  } else {
    const created = await data.createProject(fields);
    projectId = created.id;
  }

  revalidateAll(projectId);
  redirect("/admin/projects");
}

export async function deleteProjectAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  if (id) await data.deleteProject(id);
  revalidateAll();
  redirect("/admin/projects");
}

export async function toggleProjectStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const next = form.get("status") === "published" ? "draft" : "published";
  if (id) await data.setProjectStatus(id, next);
  revalidateAll(id);
}

// Reordering is one swap at a time, driven by the up/down buttons on the
// projects list. The whole ordered list is written back so display_order
// stays a clean 0..n-1 sequence with no gaps.
export async function moveProject(form: FormData) {
  await requireAdmin();

  const id = text(form, "id");
  const direction = text(form, "direction");
  const projects = await data.getAllProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= projects.length) return; // already at the end

  const ordered = [...projects];
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  await data.reorderProjects(ordered.map((p) => p.id));

  revalidateAll();
}

// ---------- PROJECT GALLERY IMAGES ----------

export async function addProjectImageAction(form: FormData) {
  await requireAdmin();
  const projectId = text(form, "project_id");
  const url = text(form, "image_url");
  if (projectId && url) await data.addProjectImage(projectId, url);
  revalidateAll(projectId);
}

export async function deleteProjectImageAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  if (id) await data.deleteProjectImage(id);
  revalidateAll(text(form, "project_id"));
}

// ---------- SETTINGS ----------

export async function saveSettings(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  await requireAdmin();

  await data.upsertSiteSettings({
    phone: text(form, "phone"),
    email: text(form, "email"),
    instagram: text(form, "instagram"),
  });

  revalidateAll();
  return {};
}
