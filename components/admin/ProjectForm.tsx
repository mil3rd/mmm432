"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Checkbox, Field, FormError, Select, SubmitButton, TextArea } from "@/components/admin/ui";
import { saveProject, type ActionResult } from "@/lib/actions";
import type { Project } from "@/types/database";

export default function ProjectForm({ project }: { project?: Project | null }) {
  const [state, formAction] = useFormState<ActionResult, FormData>(saveProject, {});

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-5">
      <FormError message={state.error} />

      {/* Presence of this tells the action to update rather than insert. */}
      {project && <input type="hidden" name="id" value={project.id} />}

      <Field label="Title" name="title" defaultValue={project?.title} required />
      <Field label="Web address" name="slug" defaultValue={project?.slug}
        hint="Leave blank and it's built from the title. Letters, numbers and dashes." />

      <TextArea label="Description" name="description" defaultValue={project?.description} rows={4} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" name="category" defaultValue={project?.category} placeholder="Branding" />
        <Field label="Year" name="year" defaultValue={project?.year} placeholder="2025" />
      </div>

      <Field label="Your role" name="role" defaultValue={project?.role} placeholder="Art Director" />
      <TextArea label="Responsibilities" name="responsibilities" defaultValue={project?.responsibilities} rows={3} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tools" name="tools" defaultValue={project?.tools?.join(", ")}
          placeholder="Figma, After Effects" hint="Separate with commas." />
        <Field label="Skills" name="skills" defaultValue={project?.skills?.join(", ")}
          placeholder="Motion, Layout" hint="Separate with commas." />
      </div>

      <ImageUploadField
        label="Cover image"
        name="cover_image"
        defaultValue={project?.cover_image}
        aspect="aspect-[3/4]"
        hint="The card image on the homepage. Portrait, cropped to 3:4."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Link" name="external_url" type="url" defaultValue={project?.external_url}
          placeholder="https://behance.net/..." hint="Optional. Without it the card isn't clickable." />
        <Field label="Link label" name="external_url_label" defaultValue={project?.external_url_label}
          placeholder="Explore" />
      </div>

      <Checkbox label="Featured" name="is_featured" defaultChecked={project?.is_featured}
        hint="Adds the red Featured tag to the card." />

      <Select label="Status" name="status" defaultValue={project?.status ?? "draft"}
        options={[
          { value: "draft", label: "Draft — only you can see it" },
          { value: "published", label: "Published — live on the site" },
        ]}
      />

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
        <Link href="/admin/projects" className="font-body text-sm text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
