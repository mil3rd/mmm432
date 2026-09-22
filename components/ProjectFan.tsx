import ProfileCard from "@/components/ProfileCard";
import ProjectCard from "@/components/ProjectCard";
import type { Profile, Project } from "@/types/database";

// Past this the spread stops reading as a hand of cards and starts reading as
// a mess. Anything beyond it falls through to the wall below.
export const MAX_IN_FAN = 6;

// The ring of drifting text the cards are dealt over.
function Ring() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="pointer-events-none absolute left-1/2 top-[8%] h-[360px] w-[360px] -translate-x-1/2 animate-ring text-ink/25 sm:h-[420px] sm:w-[420px]"
    >
      <defs>
        <path
          id="fan-ring"
          fill="none"
          d="M200,200 m-152,0 a152,152 0 1,1 304,0 a152,152 0 1,1 -304,0"
        />
      </defs>
      <text fontSize="17" letterSpacing="7" fill="currentColor" className="font-display uppercase">
        <textPath href="#fan-ring">
          Portfolio • Portfolio • Portfolio • Portfolio • Portfolio •
        </textPath>
      </text>
    </svg>
  );
}

export default function ProjectFan({
  profile,
  projects,
}: {
  profile: Profile;
  projects: Project[];
}) {
  // The portrait is dealt into the middle of the spread — the way the
  // reference holds the one card that isn't a piece of work at the centre.
  const slots: Array<{ key: string; node: React.ReactNode }> = projects
    .slice(0, MAX_IN_FAN)
    .map((project) => ({
      key: project.id,
      node: <ProjectCard project={project} variant="fan" />,
    }));

  slots.splice(Math.ceil(slots.length / 2), 0, {
    key: "profile",
    node: <ProfileCard profile={profile} variant="fan" />,
  });

  const centre = (slots.length - 1) / 2;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#D8D7D3_0%,#E7E6E3_45%,#EFEEEB_100%)] px-6 pb-20 pt-4 sm:px-10">
      {/* Scaling the whole composition keeps the arc's proportions intact
          instead of recalculating the spread at every breakpoint. */}
      <div className="relative mx-auto h-[300px] w-full max-w-[1180px] sm:h-[400px] lg:h-[470px]">
        <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-[0.46] sm:scale-[0.68] lg:scale-100">
          <Ring />

          <div className="relative h-[420px] w-[1100px]">
            {slots.map(({ key, node }, index) => {
              const offset = index - centre;
              // Cards rotate away from centre and drop along a shallow arc,
              // so the middle of the spread sits highest and most forward.
              const rotate = offset * 11;
              const x = offset * 104;
              const y = Math.pow(Math.abs(offset), 1.75) * 15;
              const z = 100 - Math.round(Math.abs(offset) * 10);

              return (
                <div
                  key={key}
                  className="absolute left-1/2 top-0"
                  style={{
                    transform: `translateX(-50%) translate(${x}px, ${y}px) rotate(${rotate}deg)`,
                    zIndex: z,
                  }}
                >
                  {node}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="relative mt-2 text-center font-display text-sm uppercase tracking-[0.12em] text-muted">
          New work is on its way.
        </p>
      )}
    </section>
  );
}
