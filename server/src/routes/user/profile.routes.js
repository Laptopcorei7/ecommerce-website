const express = require("express");
const {
  httpGetProfile,
  httpUpdateProfile,
  httpChangePassword,
} = require("../../controllers/profile.controller");

const { requireAuth } = require("../../middleware/auth.middleware");

const profileRouter = express.Router();

// requireAuth is attached per route, not via a bare `profileRouter.use()`.
// This router is mounted at the root with `app.use(profileRouter)`, so a
// path-less `use` ran requireAuth against every request that reached it and
// 401'd anything registered later, public review listings included.
profileRouter.get("/profile", requireAuth, httpGetProfile);
profileRouter.put("/profile", requireAuth, httpUpdateProfile);
profileRouter.put("/profile/password", requireAuth, httpChangePassword);

module.exports = {
  profileRouter: profileRouter,
};
