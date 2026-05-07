const express = require("express");

const { requireAuth } = require("../../middleware/auth.middleware");

const protectedRouter = express.Router();

protectedRouter.get("/protected", requireAuth, requireAuth, (req, res) => {
  return res.status(200).json({
    message: "You have access to this protected route!",
    user: {
      name: req.user.name,
      email: req.user.email,
    },
  });
});

module.exports = {
  protectedRouter: protectedRouter,
};
