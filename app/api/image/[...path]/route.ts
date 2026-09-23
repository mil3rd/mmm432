import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getBlobToken } from "@/lib/blob-token";

// Serves images out of the private Blob store.
//
// The store is private, so blob URLs are not readable by a browser. Every
// upload is stored in the database as /api/image/<pathname> instead, and
// this route streams the bytes with the server token. Filenames carry a
// timestamp and a random suffix, so the response can be cached forever:
// after the first hit Vercel's CDN serves it without touching this code.
//
// No login check: these are the public site's images.
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathname = params.path.map(decodeURIComponent).join("/");
  if (!pathname.startsWith("portfolio/") || pathname.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const token = getBlobToken();
  if (!token) {
    return new NextResponse("Image storage isn't configured", { status: 503 });
  }

  const result = await get(pathname, {
    access: "private",
    token,
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });
  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  const cache = "public, max-age=31536000, s-maxage=31536000, immutable";
  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: { "cache-control": cache } });
  }
  return new NextResponse(result.stream, {
    headers: {
      "content-type": result.blob.contentType,
      "content-length": String(result.blob.size),
      "cache-control": cache,
      etag: result.blob.etag,
    },
  });
}
