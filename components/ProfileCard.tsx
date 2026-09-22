import Image from "next/image";
import type { Profile } from "@/types/database";

// Visually distinct from ProjectCard on purpose: this is the one card
// that represents Mild herself, not a piece of work. In the fan it sits
// at the centre of the spread and is the only card that carries a caption
// under the portrait.
export default function ProfileCard({
  profile,
  variant = "wall",
}: {
  profile: Profile;
  variant?: "fan" | "wall";
}) {
  const fan = variant === "fan";

  const shell = fan
    ? "w-[190px] rounded-2xl shadow-[0_28px_55px_-14px_rgba(18,18,18,0.55)] sm:w-[210px]"
    : "w-[280px] rotate-[-3deg] rounded-sm shadow-[8px_8px_0_0_#121212] sm:w-[300px]";

  return (
    <div className={`relative overflow-hidden bg-card ${shell}`}>
      <div
        className={`w-full overflow-hidden bg-[#DFDEDA] ${
          fan ? "aspect-[3/4.35]" : "mb-4 aspect-[3/4]"
        }`}
      >
        {profile.profile_image ? (
          <Image
            src={profile.profile_image}
            alt={profile.display_name ?? profile.name}
            width={300}
            height={400}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-xs uppercase text-muted">
            Portrait
          </div>
        )}
      </div>

      <div className={fan ? "p-3.5" : "px-5 pb-5"}>
        <h3 className="font-display text-sm uppercase leading-none text-ink">
          {profile.display_name ?? profile.name}
        </h3>
        {profile.title && (
          <p className="mt-1 font-body text-xs text-muted">{profile.title}</p>
        )}
        {!fan && profile.bio && (
          <p className="mt-3 font-body text-sm leading-snug text-ink/80">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
