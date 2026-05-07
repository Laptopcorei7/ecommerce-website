const Order = require("../models/product/order.mongo");
const Product = require("../models/product/product.mongo");
const Register = require("../models/user/register.mongo");
const Review = require("../models/reviews/review.mongo");
const { formatCurrency, formatPercentage } = require("../utils/currency");

async function httpGetDashboardOverview(req, res) {
  try {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalReviews,
      todayOrders,
      thisMonthOrders,
      lastMonthOrders,
      revenueStats,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Register.countDocuments(),
      Review.countDocuments(),

      Order.countDocuments({ createdAt: { $gte: startOfToday } }),

      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),

      Order.countDocuments({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      }),

      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            averageOrderValue: { $avg: "$total" },
          },
        },
      ]),

      Order.countDocuments({ status: "pending" }),

      Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
    ]);

    const orderGrowth =
      lastMonthOrders > 0
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const averageOrderValue = revenueStats[0]?.averageOrderValue || 0;

    return res.status(200).json({
      overview: {
        totalOrders: totalOrders,
        totalProducts: totalProducts,
        totalUsers: totalUsers,
        totalReviews: totalReviews,
        pendingOrders: pendingOrders,
        lowStockProducts: lowStockProducts,
        outOfStockProducts: await Product.countDocuments({ stock: 0 }),
      },
      today: {
        orders: todayOrders,
        newUsers: await Register.countDocuments({
          createdAt: { $gte: startOfToday },
        }),
        newReviews: await Review.countDocuments({
          createdAt: { $gte: startOfToday },
        }),
      },
      thisMonth: {
        orders: thisMonthOrders,
        orderGrowth: formatPercentage(orderGrowth),
      },
      revenue: {
        total: formatCurrency(totalRevenue),
        averageOrderValue: formatCurrency(averageOrderValue),
      },
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    return res.status(500).json({
      error: "Failed to get dashboard overview",
    });
  }
}

async function httpGetOrderStats(req, res) {
  try {
    const orderByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]);

    const statusStats = {};
    let totalRevenue = 0;

    orderByStatus.forEach((stat) => {
      statusStats[stat._id] = {
        count: stat.count,
        revenue: formatCurrency(stat.revenue),
      };
      totalRevenue += stat.revenue;
    });

    const totalOrders = await Order.countDocuments();

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return res.status(200).json({
      totalOrders: totalOrders,
      totalRevenue: formatCurrency(totalRevenue),
      averageOrderValue: formatCurrency(avgOrderValue),
      ordersByStatus: statusStats,
    });
  } catch (err) {
    console.error("Order stats error:", err);
    return res.status(500).json({
      error: "Failed to get order statistics",
    });
  }
}

async function httpGetProductStats(req, res) {
  try {
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const lowStockProducts = await Product.find({
      stock: { $lte: 5, $gt: 0 },
    })
      .select("name stock category price")
      .sort({ stock: 1 })
      .limit(10);

    const outOfStockProducts = await Product.find({ stock: 0 })
      .select("name category price")
      .limit(10);

    const totalProducts = await Product.countDocuments();

    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ]);

    const categoryStats = productsByCategory.map((cat) => ({
      category: cat._id,
      count: cat.count,
      inventoryValue: formatCurrency(cat.totalValue),
    }));

    const formattedLowStock = lowStockProducts.map((product) => ({
      id: product._id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: formatCurrency(product.price),
    }));

    const formattedOutOfStock = outOfStockProducts.map((product) => ({
      id: product._id,
      name: product.name,
      category: product.category,
      price: formatCurrency(product.price),
    }));

    return res.status(200).json({
      totalProducts: totalProducts,
      totalInventoryValue: formatCurrency(inventoryValue[0]?.totalValue || 0),
      productsByCategory: categoryStats,
      lowStockProducts: {
        count: await Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
        products: formattedLowStock,
      },
      outOfStockProducts: {
        count: await Product.countDocuments({ stock: 0 }),
        products: formattedOutOfStock,
      },
    });
  } catch (err) {
    console.error("Product stats error:", err);
    return res.status(500).json({
      error: "Failed to get product statistics",
    });
  }
}

async function httpGetSalesAnalytics(req, res) {
  try {
    const topSellingProducts = await Order.aggregate([
      { $match: { status: "delivered" } },

      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },

      { $sort: { totalSold: -1 } },

      { $limit: 10 },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },

      { $unwind: "$productInfo" },
    ]);

    const formattedTopProducts = topSellingProducts.map((item) => ({
      productId: item._id,
      productName: item.productInfo.name,
      category: item.productInfo.category,
      totalSold: item.totalSold,
      revenue: formatCurrency(item.revenue),
      currentPrice: formatCurrency(item.productInfo.price),
      currentStock: item.productInfo.stock,
    }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedMonthlyRevenue = revenueByMonth.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      revenue: formatCurrency(item.revenue),
      orderCount: item.orderCount,
    }));

    return res.status(200).json({
      topSellingProducts: formattedTopProducts,
      revenueByMonth: formattedMonthlyRevenue,
    });
  } catch (err) {
    console.error("Sales analytics error:", err);
    return res.status(500).json({
      error: "Failed to get sales analytics",
    });
  }
}

async function httpGetUserStats(req, res) {
  try {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      verifiedUsers,
      adminUsers,
      newUsersThisMonth,
      topCustomers,
    ] = await Promise.all([
      Register.countDocuments(),
      Register.countDocuments({ isVerified: true }),
      Register.countDocuments({ role: "admin" }),
      Register.countDocuments({ createdAt: { $gte: startOfMonth } }),

      Order.aggregate([
        {
          $group: {
            _id: "$userId",
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$total" },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "registers",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
      ]),
    ]);

    const formattedTopCustomers = topCustomers.map((customer) => ({
      userId: customer._id,
      name: customer.userInfo.name,
      email: customer.userInfo.email,
      totalOrders: customer.totalOrders,
      totalSpent: formatCurrency(customer.totalSpent),
    }));

    return res.status(200).json({
      totalUsers: totalUsers,
      verifiedUsers: verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      adminUsers: adminUsers,
      regularUsers: totalUsers - adminUsers,
      newUsersThisMonth: newUsersThisMonth,
      topCustomers: formattedTopCustomers,
    });
  } catch (err) {
    console.error("User stats error:", err);
    return res.status(500).json({
      error: "Failed to get user statistics",
    });
  }
}

async function httpGetRecentActivity(req, res) {
  try {
    const [recentOrders, recentReviews, recentUsers] = await Promise.all([
      Order.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber total status createdAt userId"),

      Review.find()
        .populate("userId", "name")
        .populate("productId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name email isVerified createdAt"),

      Register.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("rating title createdAt userId productId"),
    ]);

    const formattedOrders = recentOrders.map((order) => ({
      orderNumber: order.orderNumber,
      customer: order.userId ? order.userId.name : "Unknown",
      total: formatCurrency(order.total),
      status: order.status,
      createdAt: order.createdAt,
    }));

    const formattedReviews = recentReviews.map((review) => ({
      product: review.productId ? review.productId.name : "Unknown",
      user: review.userId ? review.userId.name : "Unknown",
      rating: review.rating,
      title: review.title,
      createdAt: review.createdAt,
    }));

    const formattedUsers = recentUsers.map((user) => ({
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    }));

    return res.status(200).json({
      recentOrders: formattedOrders,
      recentReviews: formattedReviews,
      recentUsers: formattedUsers,
    });
  } catch (err) {
    console.error("Recent activity error:", err);
    return res.status(500).json({
      error: "Failed to get recent activity",
    });
  }
}

module.exports = {
  httpGetDashboardOverview: httpGetDashboardOverview,
  httpGetOrderStats: httpGetOrderStats,
  httpGetProductStats: httpGetProductStats,
  httpGetSalesAnalytics: httpGetSalesAnalytics,
  httpGetUserStats: httpGetUserStats,
  httpGetRecentActivity: httpGetRecentActivity,
};
