"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploadFieldProps {
  label: string;
  name: string;              // the hidden input the form submits
  defaultValue?: string | null;
  hint?: string;
  aspect?: string;           // tailwind aspect class for the preview
}

// A file picker that uploads straight to /api/upload and keeps the resulting
// URL in a hidden input. The surrounding <form> only ever submits a string,
// so this drops into a server action without any special handling.
export default function ImageUploadField({
  label,
  name,
  defaultValue,
  hint,
  aspect = "aspect-[4/5]",
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError("");

    // Vercel Blob's own limit is far higher, but a portfolio image has no
    // business being this big and the failure is nicer to catch here.
    if (file.size > 10 * 1024 * 1024) {
      setError("That image is over 10MB. Export it smaller and try again.");
      setBusy(false);
      return;
    }

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      setUrl(result.url);
    } catch {
      setError("Upload failed — check your connection and try again.");
    } finally {
      setBusy(false);
      // Let the same file be picked again after an error.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="font-body text-xs tracking-wide text-muted">{label}</span>

      <div className="mt-1.5 flex items-start gap-4">
        <div className={`${aspect} w-28 shrink-0 overflow-hidden rounded-sm border border-line bg-paper`}>
          {url ? (
            // Not next/image: a freshly uploaded blob URL isn't in
            // next.config's remotePatterns until the page reloads.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-body text-[10px] text-muted">
              No image
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
            }}
            className="block w-full font-body text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-body file:text-xs file:text-paper hover:file:opacity-85 disabled:opacity-50"
          />

          {busy && <p className="mt-2 font-body text-xs text-muted">Uploading…</p>}
          {error && <p className="mt-2 font-body text-xs text-red">{error}</p>}
          {hint && !error && <p className="mt-2 font-body text-xs text-muted">{hint}</p>}

          {url && !busy && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="mt-2 font-body text-xs text-red underline underline-offset-2"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      <input type="hidden" name={name} value={url} />
    </div>
  );
}
