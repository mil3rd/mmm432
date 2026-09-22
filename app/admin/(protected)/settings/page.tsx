import SettingsForm from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-3xl uppercase leading-none text-ink">Settings</h1>
      <p className="mt-2 font-body text-sm text-muted">
        The contact details in the black section at the bottom of the site.
        Anything left blank is hidden.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
