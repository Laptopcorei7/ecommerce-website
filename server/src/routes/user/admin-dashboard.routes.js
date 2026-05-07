const express = require("express");

const {
  httpGetDashboardOverview,
  httpGetOrderStats,
  httpGetProductStats,
  httpGetSalesAnalytics,
  httpGetUserStats,
  httpGetRecentActivity,
} = require("../../controllers/admin-dashboard.controller");

const { requireAuth } = require("../../middleware/auth.middleware");
const { requireAdmin } = require("../../middleware/admin.middleware");

const adminDashboardRouter = express.Router();

adminDashboardRouter.use(requireAuth);
adminDashboardRouter.use(requireAdmin);

adminDashboardRouter.get("/admin/dashboard/overview", httpGetDashboardOverview);
adminDashboardRouter.get("/admin/dashboard/orders", httpGetOrderStats);
adminDashboardRouter.get("/admin/dashboard/products", httpGetProductStats);
adminDashboardRouter.get("/admin/dashboard/sales", httpGetSalesAnalytics);
adminDashboardRouter.get("/admin/dashboard/users", httpGetUserStats);
adminDashboardRouter.get("/admin/dashboard/recent", httpGetRecentActivity);

module.exports = {
  adminDashboardRouter: adminDashboardRouter,
};
