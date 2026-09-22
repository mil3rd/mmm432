import ProfileCard from "@/components/ProfileCard";
import ProjectCard from "@/components/ProjectCard";
import type { Profile, Project } from "@/types/database";

interface HeroProps {
  profile: Profile;
  firstProject?: Project;
}

// The headline and the first two cards are one composition, not a
// hero section followed by a card grid. The ghost outline behind
// "KNOW ME MORE" is the one deliberate graphic flourish.
export default function Hero({ profile, firstProject }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-10 sm:px-10 lg:px-16">
      <p className="font-body text-xs tracking-wide text-muted">
        {profile.name} — {profile.title ?? "Multimedia Designer"}
      </p>

      <div className="relative mt-6 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Headline block */}
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-1 -top-6 select-none font-display text-[20vw] uppercase leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_#12121222] lg:text-[7.5rem]"
          >
            Know
            <br />
            Me
            <br />
            More.
          </span>

          <h1 className="relative font-display text-[16vw] uppercase leading-[0.82] text-ink lg:text-[6rem]">
            Know
            <br />
            Me
            <br />
            <span className="relative inline-block">
              More.
              <span className="absolute -right-3 top-1 -z-10 h-full w-3 rotate-6 bg-red sm:w-4" />
            </span>
          </h1>

          {profile.bio && (
            <p className="relative mt-8 max-w-sm font-body text-base leading-relaxed text-ink/80">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Floating card cluster — Profile Card is always first */}
        <div className="relative mx-auto flex min-h-[420px] w-full max-w-sm items-start justify-center lg:mx-0 lg:justify-end">
          <div className="relative">
            <ProfileCard profile={profile} />
            {firstProject && (
              <div className="absolute -bottom-16 -left-16 hidden sm:block">
                <ProjectCard project={firstProject} rotate="rotate-[4deg]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
