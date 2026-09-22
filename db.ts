import { neon } from "@neondatabase/serverless";

// One shared connection helper. Usage: sql`select * from projects`
// This runs on the server only (Server Components, Route Handlers,
// Server Actions) — DATABASE_URL is never exposed to the browser.
export const sql = neon(process.env.DATABASE_URL!);
