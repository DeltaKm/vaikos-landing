#!/usr/bin/env node
/**
 * Generates a bcrypt hash for the invoice admin password.
 *
 * Usage:
 *   node scripts/hash-password.mjs "your-password-here"
 *
 * Copy the printed hash into INVOICE_ADMIN_PASSWORD_HASH in your .env file.
 * Never commit the plain password or the hash to the repository.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Utilizzo: node scripts/hash-password.mjs \"la-tua-password\"");
  process.exit(1);
}

const saltRounds = 12;
const hash = bcrypt.hashSync(password, saltRounds);

console.log("\nHash bcrypt generato:\n");
console.log(hash);
console.log("\nAggiungi questo valore a INVOICE_ADMIN_PASSWORD_HASH nel file .env\n");
