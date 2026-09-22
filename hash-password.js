// Run with: npm run hash-password -- "your-password-here"
// Copy the printed hash into ADMIN_PASSWORD_HASH in .env.local
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("\nAdd this to .env.local as ADMIN_PASSWORD_HASH:\n");
  console.log(hash);
  console.log("");
});
