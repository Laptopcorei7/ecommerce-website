const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireAdmin } = require("../../middleware/admin.middleware");
const {
  httpCreateProduct,
  httpGetAllProducts,
  httpGetProduct,
  httpUpdateProduct,
  httpDeleteProduct,
} = require("../../controllers/product.controller");

const productRouter = express.Router();

productRouter.get("/products", httpGetAllProducts);
productRouter.get("/products/:id", httpGetProduct);

productRouter.post("/products", requireAuth, requireAdmin, httpCreateProduct);
productRouter.put(
  "/products/:id",
  requireAuth,
  requireAdmin,
  httpUpdateProduct,
);
productRouter.delete(
  "/products/:id",
  requireAuth,
  requireAdmin,
  httpDeleteProduct,
);

module.exports = {
  productRouter: productRouter,
};
