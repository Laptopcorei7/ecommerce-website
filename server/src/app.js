const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { authRouter } = require("./routes/user/auth.routes");
const { protectedRouter } = require("./routes/user/protected.router");
const { productRouter } = require("./routes/products/product.routes");
const { cartRouter } = require("./routes/products/cart.routes");
const { orderRouter } = require("./routes/products/order.routes");
const { profileRouter } = require("./routes/user/profile.routes");
const { reviewRouter } = require("./routes/reviews/review.routes");
const { wishlistRouter } = require("./routes/wishlist/wishlist.routes");
const {
  adminDashboardRouter,
} = require("./routes/user/admin-dashboard.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

// The storefront runs on its own origin in development and sends the session
// cookie, so credentials must be allowed and the origin cannot be "*".
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

// Liveness probe. Deliberately does not touch the database, because it answers
// "is the process up", which is a different question from "is Mongo up".
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ── Routers ─────────────────────────────────────────────────────────────────
// Order matters: each of these is mounted at the root, so a router that
// attaches path-less middleware would affect every route registered after it.
// Auth is applied per route for exactly that reason.
app.use(authRouter);
app.use(protectedRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(orderRouter);
app.use(profileRouter);
app.use(reviewRouter);
app.use(wishlistRouter);
app.use(adminDashboardRouter);

// ── Terminal handlers ───────────────────────────────────────────────────────
// Both must come last. Express 5 routes rejected promises from async handlers
// into errorHandler on its own, so controllers can throw rather than catching
// and returning a 500 themselves.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
