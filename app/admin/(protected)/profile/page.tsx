import ProfileForm from "@/components/admin/ProfileForm";
import { getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="font-display text-3xl uppercase leading-none text-ink">Profile</h1>
      <p className="mt-2 font-body text-sm text-muted">
        This is the card on the homepage, and the name above the headline.
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}
