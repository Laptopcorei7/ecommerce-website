const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  httpAddToCart,
  httpGetCart,
  httpUpdateCartItem,
  httpRemoveCartItem,
  httpClearCart,
} = require("../../controllers/cart.controller");

const cartRouter = express.Router();

cartRouter.post("/cart", requireAuth, httpAddToCart);
cartRouter.get("/cart", requireAuth, httpGetCart);
cartRouter.put("/cart/:id", requireAuth, httpUpdateCartItem);
cartRouter.delete("/cart/:id", requireAuth, httpRemoveCartItem);
cartRouter.delete("/cart", requireAuth, httpClearCart);

module.exports = {
  cartRouter: cartRouter,
};
