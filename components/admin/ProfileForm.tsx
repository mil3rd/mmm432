"use client";

import { useFormState } from "react-dom";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Field, FormError, SubmitButton, TextArea } from "@/components/admin/ui";
import { saveProfile, type ActionResult } from "@/lib/actions";
import type { Profile } from "@/types/database";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction] = useFormState<ActionResult, FormData>(saveProfile, {});

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-5">
      <FormError message={state.error} />

      <Field label="Name" name="name" defaultValue={profile?.name} required
        hint="Your full name, shown above the headline." />
      <Field label="Display name" name="display_name" defaultValue={profile?.display_name}
        hint="The short name on the profile card — e.g. Mild." />
      <Field label="Title" name="title" defaultValue={profile?.title}
        placeholder="Multimedia Designer" />
      <TextArea label="Bio" name="bio" defaultValue={profile?.bio} rows={4}
        hint="One or two sentences. Appears under the headline and on the card." />
      <Field label="Location" name="location" defaultValue={profile?.location} placeholder="Bangkok, Thailand" />

      <ImageUploadField
        label="Profile photo"
        name="profile_image"
        defaultValue={profile?.profile_image}
        hint="Portrait orientation looks best — the card crops to 4:5."
      />

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton>Save profile</SubmitButton>
      </div>
    </form>
  );
}
