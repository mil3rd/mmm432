import Link from "next/link";
import { getAllProjects } from "@/lib/data";
import { moveProject, toggleProjectStatus } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Projects</h1>
          <p className="mt-2 font-body text-sm text-muted">
            The order here is the order on the site. Only published projects are visible.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-sm bg-ink px-4 py-2 font-body text-sm text-paper transition-opacity hover:opacity-85"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-line p-10 text-center">
          <p className="font-body text-sm text-muted">
            No projects yet.{" "}
            <Link href="/admin/projects/new" className="text-ink underline underline-offset-4">
              Add the first one.
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center gap-4 rounded-sm border border-line bg-card p-4"
            >
              {/* Reorder controls. Buttons rather than drag-and-drop:
                  keyboard-accessible and reliable on touch, for a list
                  that's a handful of items long. */}
              <div className="flex flex-col gap-1">
                <form action={moveProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label={`Move ${project.title} up`}
                    className="flex h-5 w-5 items-center justify-center rounded-sm border border-line font-body text-xs text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-30 disabled:hover:border-line"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === projects.length - 1}
                    aria-label={`Move ${project.title} down`}
                    className="flex h-5 w-5 items-center justify-center rounded-sm border border-line font-body text-xs text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-30 disabled:hover:border-line"
                  >
                    ↓
                  </button>
                </form>
              </div>

              <div className="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-paper">
                {project.cover_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={project.cover_image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-body text-[9px] text-muted">
                    —
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base uppercase leading-tight text-ink">
                  {project.title}
                  {project.is_featured && (
                    <span className="ml-2 align-middle bg-red px-1.5 py-0.5 font-body text-[9px] tracking-wide text-card">
                      Featured
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate font-body text-xs text-muted">
                  {[project.category, project.year].filter(Boolean).join(" · ") || "No category"}
                </p>
              </div>

              <form action={toggleProjectStatus}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="status" value={project.status} />
                <button
                  type="submit"
                  className={`rounded-sm px-2.5 py-1 font-body text-xs transition-opacity hover:opacity-75 ${
                    project.status === "published"
                      ? "bg-ink text-paper"
                      : "border border-line text-muted"
                  }`}
                  title={
                    project.status === "published"
                      ? "Published — click to unpublish"
                      : "Draft — click to publish"
                  }
                >
                  {project.status === "published" ? "Published" : "Draft"}
                </button>
              </form>

              <Link
                href={`/admin/projects/${project.id}`}
                className="rounded-sm border border-line px-3 py-1.5 font-body text-xs text-ink transition-colors hover:border-ink"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
