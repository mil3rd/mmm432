"use client";

import { useFormState } from "react-dom";
import { Field, FormError, SubmitButton } from "@/components/admin/ui";
import { saveSettings, type ActionResult } from "@/lib/actions";
import type { SiteSettings } from "@/types/database";

export default function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction] = useFormState<ActionResult, FormData>(saveSettings, {});

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-5">
      <FormError message={state.error} />

      <Field label="Phone" name="phone" type="tel" defaultValue={settings?.phone}
        hint="Leave blank to hide it from the contact section." />
      <Field label="Email" name="email" type="email" defaultValue={settings?.email} />
      <Field label="Instagram" name="instagram" defaultValue={settings?.instagram}
        placeholder="@yourhandle"
        hint="Handle only — the link is built for you." />

      <div className="pt-2">
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  );
}
