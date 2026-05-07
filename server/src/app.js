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

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(helmet());
app.use(cookieParser());
app.use(
  express.json({
    limit: "100kb",
  }),
);

app.use(authRouter);
app.use(protectedRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(orderRouter);
app.use(profileRouter);
app.use(reviewRouter);
app.use(wishlistRouter);
app.use(adminDashboardRouter);

module.exports = app;
