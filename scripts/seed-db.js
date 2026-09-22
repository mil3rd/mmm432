// Inserts a starter profile row so the homepage renders before anything has
// been entered in Admin. Run with: npm run db:seed
// Does nothing if a profile already exists — safe to re-run.
require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

(async () => {
  const sql = neon(url);
  try {
    const existing = await sql`select id from profiles limit 1`;
    if (existing.length) {
      console.log("\nA profile row already exists — left untouched.\n");
      return;
    }
    await sql`
      insert into profiles (name, display_name, title, bio)
      values ('Phassaree Prasai', 'Mild', 'Multimedia Designer',
              'Creative designer exploring visual identity, motion, and visual storytelling.')
    `;
    console.log("\nSeeded the starter profile row. Edit it in Admin -> Profile.\n");
  } catch (err) {
    console.error("\nSeed failed:\n", err.message, "\n");
    process.exitCode = 1;
  }
})();
