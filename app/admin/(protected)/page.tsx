import Link from "next/link";
import { getAllProjects, getProfile, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [projects, profile, settings] = await Promise.all([
    getAllProjects(),
    getProfile(),
    getSiteSettings(),
  ]);

  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.length - published;

  const stats = [
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
    { label: "Total projects", value: projects.length },
  ];

  // Anything that would make the public page look unfinished, surfaced as a
  // to-do list rather than left for her to discover by looking at the site.
  const todos = [
    !profile && { text: "Add your profile — the homepage won't render without it.", href: "/admin/profile" },
    profile && !profile.profile_image && { text: "Add a profile photo.", href: "/admin/profile" },
    projects.length === 0 && { text: "Add your first project.", href: "/admin/projects/new" },
    published === 0 && projects.length > 0 && { text: "Nothing is published yet — the work wall is empty.", href: "/admin/projects" },
    !settings && { text: "Add your contact details.", href: "/admin/settings" },
  ].filter(Boolean) as { text: string; href: string }[];

  return (
    <div>
      <h1 className="font-display text-3xl uppercase leading-none text-ink">Dashboard</h1>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-sm border border-line bg-card p-5">
            <p className="font-display text-3xl leading-none text-ink">{stat.value}</p>
            <p className="mt-2 font-body text-xs tracking-wide text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {todos.length > 0 && (
        <div className="mt-8 rounded-sm border border-line bg-card p-5">
          <p className="font-body text-xs tracking-wide text-muted">Still to do</p>
          <ul className="mt-3 space-y-2">
            {todos.map((todo) => (
              <li key={todo.href + todo.text}>
                <Link href={todo.href} className="font-body text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-red">
                  {todo.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/projects/new" className="rounded-sm bg-ink px-4 py-2 font-body text-sm text-paper transition-opacity hover:opacity-85">
          New project
        </Link>
        <Link href="/admin/profile" className="rounded-sm border border-line px-4 py-2 font-body text-sm text-ink transition-colors hover:border-ink">
          Edit profile
        </Link>
      </div>
    </div>
  );
}
