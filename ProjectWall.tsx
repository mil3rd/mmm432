import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/types/database";

// Alternating rotation/offset gives the "art-directed" feel without
// per-card manual positioning — it stays correct as projects are
// added, deleted, or reordered from Admin.
const ROTATIONS = ["rotate-[-3deg]", "rotate-[2deg]", "rotate-[-1.5deg]", "rotate-[3deg]"];
const OFFSETS = ["lg:translate-y-0", "lg:translate-y-10", "lg:-translate-y-4", "lg:translate-y-6"];

export default function ProjectWall({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <section className="px-6 py-20 text-center sm:px-10 lg:px-16">
        <p className="font-display text-lg uppercase text-muted">
          New work is on its way.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-10 font-body text-xs tracking-wide text-muted">
        Selected work — {projects.length} project{projects.length === 1 ? "" : "s"}
      </p>
      <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-16 lg:justify-start">
        {projects.map((project, i) => (
          <div key={project.id} className={OFFSETS[i % OFFSETS.length]}>
            <ProjectCard project={project} rotate={ROTATIONS[i % ROTATIONS.length]} />
          </div>
        ))}
      </div>
    </section>
  );
}
