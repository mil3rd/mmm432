"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/admin/ui";
import { deleteProjectAction } from "@/lib/actions";

// Two-step rather than a native confirm(): a browser dialog blocks the page
// and can't be styled, and deleting a project is permanent enough to deserve
// a deliberate second click.
export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="inline-flex items-center rounded-sm border border-red px-4 py-2 font-body text-sm text-red transition-colors hover:bg-red hover:text-card"
      >
        Delete project
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <p className="font-body text-sm text-ink">Delete permanently?</p>
      <form action={deleteProjectAction}>
        <input type="hidden" name="id" value={projectId} />
        <SubmitButton variant="danger">Yes, delete</SubmitButton>
      </form>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="font-body text-sm text-muted hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}
