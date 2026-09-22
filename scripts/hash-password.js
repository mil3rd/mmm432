// Run with: npm run hash-password -- "your-password-here"
// Prints the bcrypt hash to put in ADMIN_PASSWORD_HASH.
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  // A bcrypt hash always contains $ signs ($2a$10$...). The library Next uses
  // to read .env files expands $NAME as a variable, so an unescaped hash gets
  // silently chewed down to a fragment and every login fails with no error
  // that points here. Escaping each $ is what makes it survive the file.
  const escaped = hash.replace(/\$/g, "\\$");

  console.log("\n--- for .env.local (the $ signs must stay escaped) ---\n");
  console.log(`ADMIN_PASSWORD_HASH="${escaped}"`);
  console.log("\n--- for the Vercel dashboard (paste the raw value, no escaping) ---\n");
  console.log(hash);
  console.log("");
});
