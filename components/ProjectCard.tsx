import Image from "next/image";
import type { Project } from "@/types/database";

interface ProjectCardProps {
  project: Project;
  rotate?: string; // Tailwind rotate class, set per-position by the grid
  // "fan" is the overlapping spread under the hero: rounded corners and a
  // cast shadow, so the cards read as a physical hand held above the page.
  // "wall" is the flat grid of any extras, which keeps the hard offset shadow.
  variant?: "fan" | "wall";
}

export default function ProjectCard({ project, rotate = "", variant = "wall" }: ProjectCardProps) {
  const hasLink = Boolean(project.external_url);
  const fan = variant === "fan";

  const shell = fan
    ? "w-[190px] rounded-2xl shadow-[0_24px_45px_-14px_rgba(18,18,18,0.5)] sm:w-[210px]"
    : "w-[240px] rounded-sm shadow-[6px_6px_0_0_rgba(18,18,18,0.9)] transition-transform duration-300 hover:-translate-y-1 sm:w-[260px]";

  const content = (
    <div className={`group relative overflow-hidden bg-card ${shell} ${rotate}`}>
      {project.is_featured && (
        <span
          className={`absolute z-10 bg-red px-2 py-1 font-body text-[10px] tracking-wide text-card ${
            fan ? "left-3 top-3" : "-top-3 left-4"
          }`}
        >
          Featured
        </span>
      )}

      <div className={`w-full overflow-hidden bg-[#DFDEDA] ${fan ? "aspect-[3/4.35]" : "aspect-[3/4]"}`}>
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={project.title}
            width={260}
            height={347}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center font-display text-xs uppercase text-muted">
            {project.title}
          </div>
        )}
      </div>

      {fan ? (
        // In the spread the cards are images, not list rows — overlapping
        // caption bars turn the arc into noise. The title comes back on hover,
        // and the link's aria-label carries it for screen readers regardless.
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="truncate font-display text-xs uppercase leading-tight text-card">
            {project.title}
          </p>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 p-4">
          <div className="min-w-0">
            <h4 className="font-display text-base uppercase leading-tight text-ink">
              {project.title}
            </h4>
            <p className="mt-1 truncate font-body text-xs text-muted">
              {[project.category, project.year].filter(Boolean).join(" · ")}
            </p>
          </div>
          {hasLink && (
            <span className="mt-1 shrink-0 font-body text-xs text-red transition-transform duration-300 group-hover:translate-x-1">
              {project.external_url_label ?? "Explore"}
            </span>
          )}
        </div>
      )}
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
