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

wishlistRouter.use(requireAuth);

wishlistRouter.post("/wishlist", httpAddToWishlist);
wishlistRouter.get("/wishlist", httpGetWishlist);
wishlistRouter.delete("/wishlist/:productId", httpRemoveFromWishlist);
wishlistRouter.delete("/wishlist", httpClearWishlist);

wishlistRouter.post("/wishlist/:productId/cart", httpMoveToCart);

module.exports = {
  wishlistRouter: wishlistRouter,
};
