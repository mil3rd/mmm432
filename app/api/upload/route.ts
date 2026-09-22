import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";

const MAX_BYTES = 10 * 1024 * 1024;

// Used by the Admin project/profile editors' image upload fields.
// Returns { url } which gets saved into cover_image / profile_image /
// a project_images row.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Without a token @vercel/blob throws something unreadable. This is the
  // single most likely setup mistake, so it gets its own message.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Image storage isn't configured yet. Add BLOB_READ_WRITE_TOKEN from your Vercel Blob store to .env.local.",
      },
      { status: 501 }
    );
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // The client checks both of these too, but the client is not the boundary.
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "That file isn't an image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That image is over 10MB." }, { status: 413 });
  }

  try {
    const blob = await put(`portfolio/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Blob upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed at the storage provider. Check the Blob token is valid." },
      { status: 502 }
    );
  }
}
