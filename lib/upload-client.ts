"use client";

import { upload } from "@vercel/blob/client";
import { shrinkImage } from "./shrink-image";

// Keep in sync with MAX_UPLOAD_BYTES in app/api/upload/route.ts. Not imported
// from there: this file is bundled into the browser and must not pull in the
// server-only auth module that route imports.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Anything still this big after shrinking (a huge PNG, say) goes up in
// parallel parts instead of one long request.
const MULTIPART_OVER_BYTES = 5 * 1024 * 1024;

const UPLOAD_TIMEOUT_MS = 60 * 1000;

export class UploadError extends Error {}

export type UploadStage = "shrinking" | "uploading";

export interface UploadProgress {
  stage: UploadStage;
  /** bytes that will actually be sent (known once shrinking is done) */
  bytes: number;
}

// Sends an image straight from the browser to Vercel Blob and returns its
// public URL. /api/upload only issues the token, so this is not subject to
// Vercel's 4.5MB request-body limit on serverless functions.
//
// The image is shrunk in the browser first (see shrink-image.ts); that is
// what makes uploads fast. The 10MB limit applies to what is actually sent.
export async function uploadImage(
  original: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  if (!original.type.startsWith("image/")) {
    throw new UploadError("That file isn't an image.");
  }

  onProgress?.({ stage: "shrinking", bytes: original.size });
  const { file } = await shrinkImage(original);

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("That image is over 10MB even after shrinking. Export it smaller and try again.");
  }
  onProgress?.({ stage: "uploading", bytes: file.size });

  try {
    const blob = await upload(`portfolio/${Date.now()}-${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type,
      multipart: file.size > MULTIPART_OVER_BYTES,
      // The SDK retries a refused PUT ten times with growing backoff, close
      // to twenty minutes, before it gives up. Files are under 1MB after
      // shrinking, so anything still running after this is not going to
      // succeed; stop and let explain() report the real reason.
      abortSignal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });
    return blob.url;
  } catch (error) {
    throw new UploadError(await explain(error));
  }
}

export function describe(progress: UploadProgress): string {
  const mb = (progress.bytes / (1024 * 1024)).toFixed(1);
  return progress.stage === "shrinking" ? "Shrinking image…" : `Uploading ${mb} MB…`;
}

// The SDK collapses every non-2xx from /api/upload into one generic message,
// so ask the route what is wrong before giving up. If the route says the
// token is fine, the failure happened on the direct browser → Blob leg, and
// the SDK's own message for that is the most specific thing we have.
async function explain(error: unknown): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/upload", { method: "GET" });
  } catch {
    return "Upload failed — check your connection and try again.";
  }
  if (!response.ok) {
    try {
      const result = (await response.json()) as { error?: string };
      if (result.error) return result.error;
    } catch {
      // fall through to the SDK's message
    }
  }
  const message = error instanceof Error ? error.message.replace(/^Vercel Blob: /, "") : "";
  if (/content.?type/i.test(message)) return "That file type isn't allowed.";
  if (/size|too large|413/i.test(message)) return "That image is over 10MB. Export it smaller and try again.";
  return message
    ? `Upload failed at the storage provider: ${message}`
    : "Upload failed at the storage provider. Check the Blob token is valid.";
}
