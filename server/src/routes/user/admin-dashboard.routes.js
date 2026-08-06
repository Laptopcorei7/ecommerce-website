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

// Scoped to /admin. Mounted path-less, these ran against every request that
// reached this router — so an unknown URL was answered with 401/403 instead of
// a 404, and the terminal handler was never reached.
adminDashboardRouter.use("/admin", requireAuth, requireAdmin);

adminDashboardRouter.get("/admin/dashboard/overview", httpGetDashboardOverview);
adminDashboardRouter.get("/admin/dashboard/orders", httpGetOrderStats);
adminDashboardRouter.get("/admin/dashboard/products", httpGetProductStats);
adminDashboardRouter.get("/admin/dashboard/sales", httpGetSalesAnalytics);
adminDashboardRouter.get("/admin/dashboard/users", httpGetUserStats);
adminDashboardRouter.get("/admin/dashboard/recent", httpGetRecentActivity);

module.exports = {
  adminDashboardRouter: adminDashboardRouter,
};
