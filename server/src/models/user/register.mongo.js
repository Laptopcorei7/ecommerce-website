const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const registerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    employeeId: {
      type: String,
      sparse: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

registerSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hash = await bcrypt.hash(this.password, saltRounds);
  this.password = hash;
});

module.exports = mongoose.model("Register", registerSchema);
