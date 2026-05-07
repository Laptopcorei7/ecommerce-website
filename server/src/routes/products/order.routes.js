const express = require("express");

const { requireAuth } = require("../../middleware/auth.middleware");
const { requireAdmin } = require("../../middleware/admin.middleware");
const {
  httpCreateOrder,
  httpGetUserOrders,
  httpGetOrder,
  httpGetAllOrders,
  httpUpdateOrderStatus,
  httpCancelOrder,
} = require("../../controllers/order.controller");

const orderRouter = express.Router();

orderRouter.post("/orders", requireAuth, httpCreateOrder);
orderRouter.get("/orders", requireAuth, httpGetUserOrders);
orderRouter.get("/order/:id", requireAuth, httpGetOrder);
orderRouter.put("/orders/:id/cancel", requireAuth, httpCancelOrder);

orderRouter.get(
  "/order/all/admin",
  requireAuth,
  requireAdmin,
  httpGetAllOrders,
);
orderRouter.put(
  "/orders/:id/status",
  requireAuth,
  requireAdmin,
  httpUpdateOrderStatus,
);

module.exports = {
  orderRouter: orderRouter,
};
