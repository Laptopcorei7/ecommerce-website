const express = require("express");

const {
  httpCreateReview,
  httpGetProductReviews,
  httpGetReview,
  httpUpdateReview,
  httpDeleteReview,
  httpGetUserReviews,
} = require("../../controllers/review.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const reviewRouter = express.Router();

reviewRouter.get("/products/:productId/reviews", httpGetProductReviews);
reviewRouter.get("/reviews/:reviewId", httpGetReview);

reviewRouter.post(
  "/products/:productId/reviews",
  requireAuth,
  httpCreateReview,
);
reviewRouter.put("/reviews/:reviewId", requireAuth, httpUpdateReview);
reviewRouter.delete("/reviews/:reviewId", requireAuth, httpDeleteReview);
reviewRouter.get("/users/me/reviews", requireAuth, httpGetUserReviews);

module.exports = {
  reviewRouter: reviewRouter,
};
