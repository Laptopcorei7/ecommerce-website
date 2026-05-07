const register = require("../models/user/register.mongo");
const { getSession } = require("../controllers/login.controller");

async function requireAuth(req, res, next) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(401).json({
      error: "Please login with your email and password",
    });
  }

  const session = getSession(sessionId);

  if (!session) {
    return res.status(401).json({
      error:
        "Your session has expired. Please login again with your email and password",
    });
  }

  try {
    const userId = session.userId;
    const user = await register.findById(userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found. Please login again",
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(500).json({
      error: "Authentication failed. Please try logging in again",
    });
  }
}

module.exports = {
  requireAuth: requireAuth,
};
