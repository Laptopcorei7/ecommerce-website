const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Register = require("../models/user/register.mongo");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@store.com";

  const admin = await Register.create({
    name: "Admin User",
    email: email,
    password: "Admin123", // Will be hashed
    role: "admin",
    isVerified: true,
  });

  console.log("✓ Admin created:", admin.email);

  await mongoose.connection.close();
  process.exit(0);
}

createAdmin();
