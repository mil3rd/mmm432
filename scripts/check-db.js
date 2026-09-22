// Reports which tables exist and how many rows each holds.
// Run with: npm run db:check
require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const EXPECTED = ["profiles", "projects", "project_images", "social_links", "site_settings"];

(async () => {
  const sql = neon(url);
  try {
    const rows = await sql`
      select table_name from information_schema.tables
      where table_schema = 'public'
    `;
    const found = new Set(rows.map((r) => r.table_name));

    console.log("");
    for (const table of EXPECTED) {
      if (!found.has(table)) {
        console.log(`  MISSING  ${table}`);
        process.exitCode = 1;
        continue;
      }
      const [{ count }] = await sql(`select count(*)::int as count from ${table}`);
      console.log(`  ok       ${table} (${count} row${count === 1 ? "" : "s"})`);
    }
    console.log("");
  } catch (err) {
    console.error("\nCould not reach the database:\n", err.message, "\n");
    process.exitCode = 1;
  }
})();
