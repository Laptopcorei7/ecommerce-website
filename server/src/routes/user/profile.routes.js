const express = require("express");
const {
  httpGetProfile,
  httpUpdateProfile,
  httpChangePassword,
} = require("../../controllers/profile.controller");

const { requireAuth } = require("../../middleware/auth.middleware");

const profileRouter = express.Router();

profileRouter.use(requireAuth);

profileRouter.get("/profile", httpGetProfile);
profileRouter.put("/profile", httpUpdateProfile);
profileRouter.put("/profile/password", httpChangePassword);

module.exports = {
  profileRouter: profileRouter,
};
