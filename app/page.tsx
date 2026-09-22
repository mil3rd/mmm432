import Hero from "@/components/Hero";
import ProjectFan, { MAX_IN_FAN } from "@/components/ProjectFan";
import ProjectWall from "@/components/ProjectWall";
import Contact from "@/components/Contact";
import { getProfile, getPublishedProjects, getSiteSettings } from "@/lib/data";

export default async function HomePage() {
  const [profile, projects, settings] = await Promise.all([
    getProfile(),
    getPublishedProjects(),
    getSiteSettings(),
  ]);

  // Profile is required for the page to make sense — if it's missing,
  // Admin hasn't been set up yet, so we say that plainly instead of
  // rendering a broken-looking page.
  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fog px-6 text-center">
        <p className="font-body text-sm text-muted">
          No profile found yet. Add one in Admin → Profile to bring the site online.
        </p>
      </main>
    );
  }

  // The fan holds the first few; anything past that drops into the wall so a
  // long back catalogue stays readable.
  const overflow = projects.slice(MAX_IN_FAN);

  return (
    <main className="min-h-screen bg-fog">
      <Hero profile={profile} />
      <ProjectFan profile={profile} projects={projects} />
      {overflow.length > 0 && <ProjectWall projects={overflow} />}
      <Contact settings={settings} />
    </main>
  );
}
