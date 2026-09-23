"use client";

import { upload } from "@vercel/blob/client";

// Keep in sync with MAX_UPLOAD_BYTES in app/api/upload/route.ts. Not imported
// from there: this file is bundled into the browser and must not pull in the
// server-only auth module that route imports.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export class UploadError extends Error {}

// Sends an image straight from the browser to Vercel Blob and returns its
// public URL. /api/upload only issues the token, so this is not subject to
// Vercel's 4.5MB request-body limit on serverless functions.
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new UploadError("That file isn't an image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("That image is over 10MB. Export it smaller and try again.");
  }

  try {
    const blob = await upload(`portfolio/${Date.now()}-${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type,
    });
    return blob.url;
  } catch (error) {
    throw new UploadError(await explain(error));
  }
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
