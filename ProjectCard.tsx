import Image from "next/image";
import type { Project } from "@/types/database";

interface ProjectCardProps {
  project: Project;
  rotate?: string; // Tailwind rotate class, set per-position by the grid
}

export default function ProjectCard({ project, rotate = "" }: ProjectCardProps) {
  const hasLink = Boolean(project.external_url);

  const content = (
    <div
      className={`group relative w-[240px] rounded-sm bg-card shadow-[6px_6px_0_0_rgba(18,18,18,0.9)] transition-transform duration-300 hover:-translate-y-1 sm:w-[260px] ${rotate}`}
    >
      {project.is_featured && (
        <span className="absolute -top-3 left-4 z-10 bg-red px-2 py-1 font-body text-[10px] tracking-wide text-card">
          Featured
        </span>
      )}

      <div className="aspect-[3/4] w-full overflow-hidden bg-paper">
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={project.title}
            width={260}
            height={347}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-xs text-muted">
            {project.title}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 p-4">
        <div>
          <h4 className="font-display text-base uppercase leading-tight text-ink">
            {project.title}
          </h4>
          <p className="mt-1 font-body text-xs text-muted">
            {[project.category, project.year].filter(Boolean).join(" · ")}
          </p>
        </div>
        {hasLink && (
          <span className="mt-1 shrink-0 font-body text-xs text-red transition-transform duration-300 group-hover:translate-x-1">
            {project.external_url_label ?? "Explore"}
          </span>
        )}
      </div>
    </div>
  );

  // No URL → the card is still visible, just not clickable.
  // Never show a "view project" affordance that leads nowhere.
  if (!hasLink) return content;

  return (
    <a
      href={project.external_url!}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${project.title}`}
    >
      {content}
    </a>
  );
}
