"use client";

import { useRef, useState } from "react";
import { describe, uploadImage, UploadError } from "@/lib/upload-client";
import { addProjectImageAction, deleteProjectImageAction } from "@/lib/actions";
import type { ProjectImage } from "@/types/database";

// Gallery images are saved the moment they upload, not on form submit —
// they belong to a project that already exists, so there's nothing to defer.
export default function GalleryManager({
  projectId,
  images,
}: {
  projectId: string;
  images: ProjectImage[];
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      // Goes browser → Vercel Blob directly; see lib/upload-client.ts.
      const url = await uploadImage(file, (p) => setStatus(describe(p)));
      // Hand the URL to the server action via its hidden input.
      if (urlRef.current) urlRef.current.value = url;
      formRef.current?.requestSubmit();
    } catch (caught) {
      setError(caught instanceof UploadError ? caught.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-10 max-w-xl border-t border-line pt-8">
      <h2 className="font-display text-lg uppercase leading-none text-ink">Gallery images</h2>
      <p className="mt-2 font-body text-sm text-muted">
        Extra photos stored against this project. Saved as soon as they upload.
      </p>

      {images.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-3">
          {images.map((image) => (
            <li key={image.id} className="relative">
              <div className="h-24 w-20 overflow-hidden rounded-sm border border-line bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.image_url} alt="" className="h-full w-full object-cover" />
              </div>
              <form action={deleteProjectImageAction}>
                <input type="hidden" name="id" value={image.id} />
                <input type="hidden" name="project_id" value={projectId} />
                <button
                  type="submit"
                  aria-label="Delete image"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink font-body text-xs text-paper transition-colors hover:bg-red"
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={addProjectImageAction} className="hidden">
        <input type="hidden" name="project_id" value={projectId} />
        <input ref={urlRef} type="hidden" name="image_url" />
      </form>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
        className="mt-5 block font-body text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-body file:text-xs file:text-paper hover:file:opacity-85 disabled:opacity-50"
      />
      {busy && <p className="mt-2 font-body text-xs text-muted">{status || "Uploading…"}</p>}
      {error && <p className="mt-2 font-body text-xs text-red">{error}</p>}
    </div>
  );
}
