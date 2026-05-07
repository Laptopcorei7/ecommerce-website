const bcrypt = require("bcrypt");
const validator = require("validator");

const Register = require("../models/user/register.mongo");
const {
  deleteOtherUserSessions,
  updateUserSessions,
} = require("../controllers/login.controller");

async function httpGetProfile(req, res) {
  const userId = req.user.id;

  try {
    const user = await Register.findById(userId).select(
      "-password -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires -__v",
    );

    if (!user) {
      return res.status.json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({
      error: "Failed to get profile",
    });
  }
}

async function httpUpdateProfile(req, res) {
  const userId = req.user.id;
  const { name, email } = req.body;

  try {
    const user = await Register.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const sessionUpdates = {};

    if (name) {
      if (typeof name != "string" || name.trim().length === 0) {
        return res.status(400).json({
          error: "Invalid name",
        });
      }
      user.name = name.trim();
      sessionUpdates.name = name.trim();
    }

    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          error: "Invalid email format",
        });
      }

      if (email != user.email) {
        const existingUser = await Register.findOne({ email: email });

        if (existingUser) {
          return res.status(400).json({
            error: "Email already in use",
          });
        }
        user.email = email;
        user.isVerified = true;
        sessionUpdates.email = email;

        // TODO: Send new verification email
        // For now, we'll just require them to verify again
      }
    }

    await user.save();

    if (Object.keys(sessionUpdates).length > 0) {
      const updatedCount = updateUserSessions(userId, sessionUpdates);
      console.log(`Update ${updatedCount} sessions with new profile data`);
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({
      error: "Failed to update",
    });
  }
}

async function httpChangePassword(req, res) {
  const userId = req.user.id;
  const currentSessionId = req.cookies.sessionId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "Current password and new password are required",
    });
  }

  try {
    const user = await Register.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
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

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        error: "New password must be different from current password",
      });
    }

    // TODO: Invalidate other sessions (optional security measure)
    // For now, we'll keep the current session active

    user.password = newPassword;
    await user.save();

    const deletedCount = deleteOtherUserSessions(userId, currentSessionId);

    console.log(
      `Password changed. Invalidated ${deletedCount} other sessions. Current session preserved`,
    );

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({
      error: "Failed to change password",
    });
  }
}

module.exports = {
  httpGetProfile: httpGetProfile,
  httpUpdateProfile: httpUpdateProfile,
  httpChangePassword: httpChangePassword,
};
