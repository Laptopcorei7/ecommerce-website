const rateLimit = require("express-rate-limit");

// Throttles the endpoints where a guessed or flooded request has a real cost:
// credential guessing on /login and /admin/login, and mailbox flooding through
// /forgot-password. Everything else is left unthrottled on purpose.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

// Account creation is slower-moving than a login attempt, so it gets a longer
// window and a smaller budget.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many accounts created from this address. Try again later.",
  },
});

module.exports = {
  authLimiter,
  registerLimiter,
};
