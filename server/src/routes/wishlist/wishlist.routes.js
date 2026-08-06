const express = require("express");

const {
  httpAddToWishlist,
  httpGetWishlist,
  httpRemoveFromWishlist,
  httpClearWishlist,
  httpMoveToCart,
} = require("../../controllers/wishlist.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const wishlistRouter = express.Router();

// Scoped to /wishlist. A path-less `use` would run requireAuth against every
// request that reached this router, including routes registered after it and
// the terminal 404 — which then answered "please login" for any unknown URL.
wishlistRouter.use("/wishlist", requireAuth);

wishlistRouter.post("/wishlist", httpAddToWishlist);
wishlistRouter.get("/wishlist", httpGetWishlist);
wishlistRouter.delete("/wishlist/:productId", httpRemoveFromWishlist);
wishlistRouter.delete("/wishlist", httpClearWishlist);

wishlistRouter.post("/wishlist/:productId/cart", httpMoveToCart);

module.exports = {
  wishlistRouter: wishlistRouter,
};
