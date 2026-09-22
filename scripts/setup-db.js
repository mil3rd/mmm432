// Creates every table in schema.sql against the database in .env.local.
// Run with: npm run db:setup
// Safe to re-run — schema.sql is written with "create ... if not exists".
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { Client, neonConfig } = require("@neondatabase/serverless");

// Node 22 ships a global WebSocket; the driver needs it pointed out explicitly.
neonConfig.webSocketConstructor = globalThis.WebSocket;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const schema = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");

(async () => {
  const client = new Client(url);
  try {
    await client.connect();
    // No parameters, so this goes over the simple query protocol, which is
    // what lets the whole multi-statement file run in one shot.
    await client.query(schema);
    console.log("\nSchema applied. Tables are ready.\n");
  } catch (err) {
    console.error("\nSchema failed to apply:\n", err.message, "\n");
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
})();
