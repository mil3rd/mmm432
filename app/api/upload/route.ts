import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { del, list } from "@vercel/blob";
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
  "Image storage isn't configured yet. Add BLOBv1_READ_WRITE_TOKEN from your Vercel Blob store to .env.local (and to the Vercel project's environment variables, then redeploy).";

// The store is connected to the Vercel project under the prefix "BLOBv1", so
// that is the name Vercel injects. The plain BLOB_ name is accepted as a
// fallback for local setups, but it must not win over BLOBv1_: production
// still carries a stale BLOB_READ_WRITE_TOKEN from an earlier store.
function getBlobToken(): string | undefined {
  return process.env.BLOBv1_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
}

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
  const token = getBlobToken();
  if (!token) {
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
      token,
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
// the browser asks here what is actually wrong. This does more than look for
// the env var: the upload token is signed locally without ever contacting
// Vercel, so a wrong, revoked or mangled token only shows up when the bytes
// are sent. Listing one blob is the cheapest way to make the store say so.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const token = getBlobToken();
  if (!token) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 501 });
  }

  // A token pasted with its quotes, or with a trailing newline, still counts
  // as "set" but can never work. Name that before blaming Vercel.
  if (!/^vercel_blob_rw_[A-Za-z0-9]+_[A-Za-z0-9]+$/.test(token)) {
    return NextResponse.json(
      {
        error:
          "BLOBv1_READ_WRITE_TOKEN is set but doesn't look like a Blob token. It should start with vercel_blob_rw_ and contain no quotes, spaces or line breaks. Re-paste it in Vercel and redeploy.",
      },
      { status: 502 }
    );
  }
  const storeId = token.split("_")[3];

  try {
    await list({ limit: 1, token });
  } catch (error) {
    const reason = error instanceof Error ? error.message.replace(/^Vercel Blob: /, "") : "unknown error";
    console.error("Blob token check failed:", error);
    return NextResponse.json(
      {
        error: `The Blob token in this deployment was rejected: ${reason} It belongs to store ${storeId}. In Vercel, open Storage, make sure that store still exists and is connected to this project, then copy its current token into BLOBv1_READ_WRITE_TOKEN and redeploy.`,
      },
      { status: 502 }
    );
  }

  // Listing proves the token is real; it does not prove the store accepts
  // writes. A suspended or over-quota store still lists fine and then fails
  // every upload, and the browser can't read that failure: an error from
  // blob.vercel-storage.com carries no CORS headers, so the SDK only sees
  // "Failed to fetch" and retries it ten times. Write one tiny object here
  // with the server token and relay exactly what Vercel says.
  const probePath = `portfolio/.write-probe-${Date.now()}.txt`;
  const probe = await fetch(`https://blob.vercel-storage.com/${probePath}`, {
    method: "PUT",
    headers: { authorization: `Bearer ${token}`, "x-api-version": "7", "x-content-type": "text/plain" },
    body: "probe",
  });
  if (!probe.ok) {
    const detail = (await probe.text()).slice(0, 400);
    console.error("Blob write probe failed:", probe.status, detail);
    return NextResponse.json(
      {
        error: `Store ${storeId} accepts reads but refuses writes. Vercel answered ${probe.status}: ${detail || "(no body)"} Open Storage in the Vercel dashboard and check the store's status and usage.`,
      },
      { status: 502 }
    );
  }
  try {
    const { url } = (await probe.json()) as { url: string };
    await del(url, { token });
  } catch (error) {
    console.warn("Could not remove write probe:", error);
  }

  return NextResponse.json({ ok: true, storeId, writes: "ok" });
}
