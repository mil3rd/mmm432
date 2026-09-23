// Vercel injects the store's token under the prefix chosen when the store
// was connected to the project. The current (private) store is connected as
// BLOBv1; the plain BLOB_ name is a fallback for local setups.
export function getBlobToken(): string | undefined {
  return process.env.BLOBv1_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
}

// Where /api/image serves a stored blob from. This is what goes into the
// database, so the rest of the site never sees a raw blob URL.
export function imagePathFor(blobPathname: string): string {
  return "/api/image/" + blobPathname.split("/").map(encodeURIComponent).join("/");
}
