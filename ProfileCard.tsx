import Image from "next/image";
import type { Profile } from "@/types/database";

// Visually distinct from ProjectCard on purpose: this is the one card
// that represents Mild herself, not a piece of work.
export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="relative w-[280px] rotate-[-3deg] rounded-sm bg-card p-5 shadow-[8px_8px_0_0_#121212] sm:w-[300px]">
      <div className="mb-4 aspect-[4/5] w-full overflow-hidden bg-paper">
        {profile.profile_image ? (
          <Image
            src={profile.profile_image}
            alt={profile.display_name ?? profile.name}
            width={300}
            height={375}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-xs text-muted">
            PHOTO
          </div>
        )}
      </div>

      <p className="font-body text-[11px] tracking-wide text-red">Profile</p>
      <h3 className="font-display text-xl uppercase leading-none text-ink">
        {profile.display_name ?? profile.name}
      </h3>
      {profile.title && (
        <p className="mt-1 font-body text-sm text-muted">{profile.title}</p>
      )}
      {profile.bio && (
        <p className="mt-3 font-body text-sm leading-snug text-ink/80">
          {profile.bio}
        </p>
      )}
    </div>
  );
}
