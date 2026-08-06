const validator = require("validator");
const crypto = require("crypto");

const { saveRegisteredUsers } = require("../models/user/register.model");

const PORT_URL = "http://localhost:8000";

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendVerificationEmail(email, token) {
  const verificationLink = `${PORT_URL}/verify?token=${token}`;

  console.log("\n==========================================");
  console.log("VERIFICATION EMAIL");
  console.log("==========================================");
  console.log(`To: ${email}`);
  console.log(`Subject: Verify Your Email`);
  console.log(`\nClick this link to verify your account:`);
  console.log(verificationLink);
  console.log("==========================================\n");
}

async function httpAddNewUser(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      error: "Invalid data types",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters",
    });
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return res.status(400).json({
      error: "Password must have a uppercase, lowercase, and number",
    });
  }

  if (!/^[a-zA-Z\s]{2,50}$/.test(name)) {
    return res.status(400).json({
      error: "Invalid name format",
    });
  }

  if (role && !["user", "admin"].includes(role)) {
    return res.status(400).json({
      error: "Invalid role.",
    });
  }

  const verificationToken = generateVerificationToken();

  const newUser = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: password,
    isVerified: false,
    verificationToken: verificationToken,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    role: role || "user",
  };

  try {
    await saveRegisteredUsers(newUser);

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "Registration successful.",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.message === "Email already exists") {
      return res.status(400).json({
        error: "Email already in use",
      });
    }
    console.error("Registration error:", err);
    return res.status(500).json({
      error:
        "Registration failed. Please check your information and try again.",
    });
  }
}

module.exports = {
  httpAddNewUser: httpAddNewUser,
};
