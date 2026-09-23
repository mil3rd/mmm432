import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { authOptions } from "@/lib/auth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Vercel's Blob service rejects a token whose content-type list it can't
// match, so this is spelled out rather than written as "image/*".
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
];

const NOT_CONFIGURED =
  "Image storage isn't configured yet. Add BLOB_READ_WRITE_TOKEN from your Vercel Blob store to .env.local (and to the Vercel project's environment variables, then redeploy).";

// Image uploads go straight from the browser to Vercel Blob. This route never
// sees the file; it only hands out a short-lived upload token.
//
// That indirection is not optional on Vercel: a serverless function cannot
// receive a request body over 4.5MB, and the platform answers with a
// plain-text 413 before the function even runs. Proxying the file through
// here worked locally and failed in production for every phone photo.
//
// The browser calls this route twice per upload, via the SDK:
//   1. type "blob.generate-client-token"  — from the admin's browser; gated
//      by the admin session.
//   2. type "blob.upload-completed"       — from Vercel's servers after the
//      bytes land; carries no session cookie, verified by signature inside
//      handleUpload instead.
export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 501 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Malformed upload request." }, { status: 400 });
  }

  if (body.type === "blob.generate-client-token") {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        addRandomSuffix: true,
      }),
      // The browser already has the URL and saves it through the form, so
      // there is nothing to record here. (This callback is also never reached
      // in local dev — Vercel can't call back to localhost.)
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Blob upload handshake failed:", error);
    return NextResponse.json(
      { error: "Upload failed at the storage provider. Check the Blob token is valid." },
      { status: 502 }
    );
  }
}

// Readiness check. The Blob SDK replaces this route's error responses with
// a generic "Failed to retrieve the client token", so when an upload fails
// the browser asks here to find out which of the two setup problems it is.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 501 });
  }
  return NextResponse.json({ ok: true });
}
