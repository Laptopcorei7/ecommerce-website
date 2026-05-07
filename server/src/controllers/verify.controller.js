const registers = require("../models/user/register.mongo");

async function httpVerifyEmail(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      error: "Verification token is required",
    });
  }

  try {
    const user = await registers.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully! You can now login.",
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({
      error: "Verification failed",
    });
  }
}

module.exports = {
  httpVerifyEmail: httpVerifyEmail,
};
