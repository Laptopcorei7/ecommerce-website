const express = require("express");
const { httpAddNewUser } = require("../../controllers/register.controller");
const {
  httpLogin,
  httpLogout,
  httpGetMe,
  httpAdminLogin,
} = require("../../controllers/login.controller");
const { httpVerifyEmail } = require("../../controllers/verify.controller");
const {
  httpForgotPassword,
  httpResetPassword,
  httpVerifyResetToken,
} = require("../../controllers/password-reset.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const authRouter = express.Router();

// Public routes (no auth required)
authRouter.post("/register", httpAddNewUser);
authRouter.get("/verify", httpVerifyEmail);
authRouter.post("/login", httpLogin);
authRouter.post("/forgot-password", httpForgotPassword);
authRouter.post("/reset-password", httpResetPassword);
authRouter.get("/reset/:token", httpVerifyResetToken);

// Protected routes (auth required)
authRouter.get("/me", requireAuth, httpGetMe);
authRouter.post("/logout", requireAuth, httpLogout);
authRouter.post("/admin/login", httpAdminLogin);

module.exports = {
  authRouter: authRouter,
};
