const mongoose = require("mongoose");

const Order = require("../models/product/order.mongo");
const Cart = require("../models/product/cart.mongo");
const Product = require("../models/product/product.mongo");
const { priceOrder } = require("../lib/pricing");

function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `ORD-${year}${month}${day}-${random}`;
}

// Puts every line of an order back into stock in a single round trip.
// $inc is applied by the server, so overlapping restocks cannot lose an update
// the way `product.stock += n; product.save()` can. A line whose product no
// longer exists matches nothing and is skipped, which is what the previous
// per-item `if (product)` check did.
async function restockOrderItems(items, session) {
  if (items.length === 0) {
    return;
  }

  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: item.quantity } },
      },
    })),
    { session: session },
  );
}

async function httpCreateOrder(req, res) {
  const userId = req.user.id;
  const { shippingAddress } = req.body;

  if (
    !shippingAddress ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.country
  ) {
    return res.status(400).json({
      error: "Complete shipping address is required (street, city, country)",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cartItems = await Cart.find({ userId: userId })
      .populate("productId")
      .session(session);

    if (cartItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.productId;

      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "One or more products in cart are no longer available",
        });
      }

      if (cartItem.quantity > product.stock) {
        await session.abortTransaction();
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}`,
          requested: cartItem.quantity,
          available: product.stock,
        });
      }

      const itemSubtotal = cartItem.quantity * cartItem.price;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Shared with the storefront so the total shown in the cart is the total
    // actually charged. See server/src/lib/pricing.js.
    const totals = priceOrder(subtotal);

    const orderNumber = generateOrderNumber();

    const order = await Order.create(
      [
        {
          userId: userId,
          orderNumber: orderNumber,
          items: orderItems,
          subtotal: totals.subtotal,
          tax: totals.tax,
          shipping: totals.shipping,
          total: totals.total,
          status: "pending",
          shippingAddress: shippingAddress,
          orderDate: new Date(),
        },
      ],
      { session },
    );

    // One round trip, and the `stock: { $gte: quantity }` filter re-checks
    // availability at write time. The loop above read stock earlier in the
    // request; between then and now another order could have taken the last
    // unit. A line that no longer has the stock simply does not match, so a
    // short modifiedCount means someone got there first and the whole order
    // is rolled back rather than overselling.
    const stockResult = await Product.bulkWrite(
      cartItems.map((cartItem) => ({
        updateOne: {
          filter: {
            _id: cartItem.productId._id,
            stock: { $gte: cartItem.quantity },
          },
          update: { $inc: { stock: -cartItem.quantity } },
        },
      })),
      { session: session },
    );

    if (stockResult.modifiedCount !== cartItems.length) {
      await session.abortTransaction();
      return res.status(409).json({
        error: "Stock changed while placing your order. Please try again.",
      });
    }

    await Cart.deleteMany({ userId: userId }, { session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Order created successfully",
      order: {
        id: order[0]._id,
        orderNumber: order[0].orderNumber,
        total: order[0].total,
        status: order[0].status,
        itemCount: order[0].items.length,
        createdAt: order[0].createdAt,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Create order error:", err);
    return res.status(500).json({
      error: "Failed to create order",
    });
  } finally {
    session.endSession();
  }
}

async function httpGetUserOrders(req, res) {
  const userId = req.user.id;
  const { status } = req.query;

  try {
    const query = { userId: userId };

    if (status) {
      const validStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          validStatuses: validStatuses,
        });
      }

      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .select("-__v");

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      itemCount: order.items?.length || 0,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      shippingAddress: order.shippingAddress || {},
    }));

    return res.status(200).json({
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({
      error: "Failed to get orders",
    });
  }
}

async function httpGetOrder(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "Order not found",
    });
  }

  try {
    const order = await Order.findById(id)
      .populate("items.productId", "name category images")
      .select("-__v");

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (!isAdmin && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Not your order",
      });
    }

    return res.status(200).json({
      order: order,
    });
  } catch (err) {
    console.error("Get order error:", err);

    if (err.kind === "ObjectId") {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.status(500).json({
      error: "Failed to get order",
    });
  }
}

async function httpGetAllOrders(req, res) {
  const { status } = req.query;

  try {
    const query = {};

    if (status) {
      const validStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          validStatuses: validStatuses,
        });
      }

      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .select("-__v");

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.userId?.name || "Deleted User",
        email: order.userId?.email || "N/A",
      },
      total: order.total,
      status: order.status,
      itemCount: order.items?.length || 0,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
    }));

    return res.status(200).json({
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (err) {
    console.error("Get all orders error:", err);
    return res.status(500).json({
      error: "Failed to get orders",
    });
  }
}

async function httpUpdateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: "Invalid status",
      validStatuses: validStatuses,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "Order not found",
    });
  }

  // Restocking and the status change have to land together: a crash between
  // them would either restock an order that is still open, or cancel one
  // without returning its stock.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        error: "Order not found",
      });
    }

    const previousStatus = order.status;
    order.status = status;

    if (status === "cancelled" && previousStatus !== "cancelled") {
      await restockOrderItems(order.items, session);
    }

    await order.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      message: "Order status updated",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryDate: order.deliveryDate,
        updatedAt: order.updatedAt,
      },
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Update order status error:", err);

    if (err.kind === "ObjectId") {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.status(500).json({
      error: "Failed to update order status",
    });
  } finally {
    session.endSession();
  }
}

async function httpCancelOrder(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Same reasoning as httpUpdateOrderStatus: the restock and the status change
  // are one unit of work. Reading the order inside the transaction also means
  // two overlapping cancellations conflict on the order document instead of
  // both passing the status check and restocking twice.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        error: "Not your order",
      });
    }

    if (!["pending", "paid"].includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        error: "Order cannot be cancelled at this stage.",
      });
    }

    order.status = "cancelled";

    await restockOrderItems(order.items, session);

    await order.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Cancel order error:", err);
    return res.status(500).json({
      error: "Failed to cancel order",
    });
  } finally {
    session.endSession();
  }
}

module.exports = {
  httpCreateOrder: httpCreateOrder,
  httpGetUserOrders: httpGetUserOrders,
  httpGetOrder: httpGetOrder,
  httpGetAllOrders: httpGetAllOrders,
  httpUpdateOrderStatus: httpUpdateOrderStatus,
  httpCancelOrder: httpCancelOrder,
};
