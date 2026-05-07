const crypto = require("crypto");
const bcrypt = require("bcrypt");

const Register = require("../models/user/register.mongo");
const { deleteAllUserSessions } = require("../controllers/login.controller");

async function httpForgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "Email is required",
    });
  }

  try {
    const user = await Register.findOne({ email: email });

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpires = Date.now() + 60 + 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, we'll log it to console
    console.log("\n==========================================");
    console.log("PASSWORD RESET REQUESTED");
    console.log("==========================================");
    console.log("Email:", email);
    console.log("Reset URL:", resetUrl);
    console.log("Token expires in 1 hour");
    console.log("==========================================\n");

    return res.status(200).json({
      message: "If that email exists, a password reset link has been sent",
    });
  } catch (err) {
    console.error("Forget password error:", err);
    return res.status(500).json({
      error: "Failed to process password reset request",
    });
  }
}

async function httpResetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: "Token and password are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long",
    });
  }

  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({
      error: "Password must contain at least one uppercase letter",
    });
  }

  if (!/[a-z]/.test(newPassword)) {
    return res.status(400).json({
      error: "Password must contain at least one lowercase letter",
    });
  }

  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({
      error: "Password must contain at least one number",
    });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Register.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gte: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        error: "New password must be different from old password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    await user.save();

    const deletedCount = deleteAllUserSessions(user._id);

    console.log("\n==========================================");
    console.log("PASSWORD RESET SUCCESSFUL");
    console.log("==========================================");
    console.log("Email:", user.email);
    console.log("Sessions invalidated:", deletedCount);
    console.log("User can now login with new password");
    console.log("==========================================\n");

    return res.status(200).json({
      message:
        "Password reset successful. You can now login with your new password",
    });
  } catch (err) {
    console.err("Reset password error:", err);
    return res.status(500).json({
      error: "Failed to reset password",
    });
  }
}

async function httpVerifyResetToken(req, res) {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      error: "Token is required",
    });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Register.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gte: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        error: "Invalid or expired reset token",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Token is valid",
    });
  } catch (err) {
    console.error("Verify reset token error:", err);
    return res.status(500).json({
      error: "Failed to verify token",
    });
  }
}

module.exports = {
  httpForgotPassword: httpForgotPassword,
  httpResetPassword: httpResetPassword,
  httpVerifyResetToken: httpVerifyResetToken,
};
