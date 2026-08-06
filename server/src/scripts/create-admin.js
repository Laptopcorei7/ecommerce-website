/**
 * Create (or update) the administrator account.
 *
 *   node src/scripts/create-admin.js
 *
 * Credentials come from the environment so they are not committed:
 *
 *   ADMIN_EMAIL=you@example.com
 *   ADMIN_PASSWORD=...
 *   ADMIN_EMPLOYEE_ID=SUN-0001
 *   ADMIN_NAME="Your Name"
 *
 * Falls back to development defaults when those are unset. The script is
 * idempotent: running it twice updates the existing account rather than
 * failing on the unique email index.
 *
 * `employeeId` matters, because /admin/login requires it alongside the email and
 * password, so an admin created without one can never sign in to the
 * administration area.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Register = require("../models/user/register.mongo");

const NAME = process.env.ADMIN_NAME || "Store Administrator";
const EMAIL = (process.env.ADMIN_EMAIL || "admin@sundry.test").toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe!2026";
const EMPLOYEE_ID = process.env.ADMIN_EMPLOYEE_ID || "SUN-0001";

async function createAdmin() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Check server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Register.findOne({ email: EMAIL });

  if (existing) {
    existing.name = NAME;
    existing.role = "admin";
    existing.employeeId = EMPLOYEE_ID;
    existing.isVerified = true;
    // Assigning triggers the pre-save hook, which hashes it.
    existing.password = PASSWORD;
    await existing.save();
    console.log(`Updated existing admin: ${existing.email}`);
  } else {
    const admin = await Register.create({
      name: NAME,
      email: EMAIL,
      password: PASSWORD,
      role: "admin",
      employeeId: EMPLOYEE_ID,
      isVerified: true,
    });
    console.log(`Created admin: ${admin.email}`);
  }

  console.log(`Employee ID: ${EMPLOYEE_ID}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      "\nUsing the default development password. Set ADMIN_PASSWORD in " +
        "server/.env and re-run before exposing this anywhere.",
    );
  }
}

createAdmin()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((err) => {
    console.error(`Failed to create admin: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
