const mongoose = require("mongoose");

const Cart = require("../models/product/cart.mongo");
const Product = require("../models/product/product.mongo");

async function httpAddToCart(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || !quantity) {
    return res.status(400).json({
      error: "Product ID and quantity are required",
    });
  }

  if (typeof quantity !== "number" || quantity < 1) {
    return res.status(400).json({
      error: "Quantity must be a number and greater than 0",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      error: "Invlaid product ID",
    });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({
        error: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        error: "Insufficient stock",
      });
    }

    const existingCartItem = await Cart.findOne({
      userId: userId,
      productId: productId,
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > product.stock) {
        res.status(400).json({
          error: "Insufficient stock",
          requested: newQuantity,
          available: product.stock,
          currentInCart: existingCartItem.quantity,
        });
      }

      existingCartItem.quantity = newQuantity;
      await existingCartItem.save();

      return res.status(200).json({
        message: "Cart updated",
        cartItem: {
          id: existingCartItem._id,
          productId: existingCartItem.productId,
          quantity: existingCartItem.quantity,
          price: existingCartItem.price,
        },
      });
    }

    const cartItem = await Cart.create({
      userId: userId,
      productId: productId,
      quantity: quantity,
      price: product.price,
    });

    return res.status(201).json({
      message: "Added to cart",
      cartItem: {
        id: cartItem._id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.price,
      },
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({
      error: "Failed to add to cart",
    });
  }
}

async function httpGetCart(req, res) {
  const userId = req.user.id;

  try {
    const cartItems = await Cart.find({ userId: userId })
      .populate("productId", "name category images stock price")
      .sort({ createdAt: -1 });

    let totalItems = 0;
    let totalPrice = 0;

    const formattedCart = cartItems.map((item) => {
      const subtotal = item.quantity * item.price;
      totalItems += item.quantity;
      totalPrice += subtotal;

      return {
        id: item._id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.productId._id,
          name: item.productId.name,
          category: item.productId.category,
          image: item.productId.images[0] || null,
          currentPrice: item.productId.price,
          stock: item.productId.stock,
        },
        subtotal: subtotal,
        addedAt: item.createdAt,
      };
    });

    return res.status(200).json({
      cart: formattedCart,
      summary: {
        totalItems: totalItems,
        totalPrice: totalPrice,
      },
    });
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({
      error: "Failed to get cart",
    });
  }
}

async function httpUpdateCartItem(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (!quantity) {
    return res.status(400).json({
      error: "Quantity is required",
    });
  }

  if (typeof quantity !== "number" || quantity < 1) {
    return res.status(400).json({
      error: "Quantity must be a number and greater than 0",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "Cart item not found",
    });
  }

  try {
    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.staus(404).json({
        error: "Cart item not found",
      });
    }

    if (cartItem.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Not your cart item",
      });
    }

    const product = await Product.findById(cartItem.productId);

    if (!product) {
      return res.status(404).json({
        error: "Product no longer available",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        error: "Insufficient stock",
        requested: quantity,
        available: product.stock,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      message: "Cart item updated",
      cartItem: {
        id: cartItem._id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.price,
      },
    });
  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({
      error: "Failed to update cart items",
    });
  }
}

async function httpRemoveCartItem(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "Cart item not found",
    });
  }

  try {
    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({
        error: "Cart item not found",
      });
    }

    if (cartItem.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Not your cart item",
      });
    }

    await Cart.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Item removed from cart",
    });
  } catch (err) {
    console.error("Remove cart item error:", err);
    return res.status(500).json({
      error: "Failed to remove cart item",
    });
  }
}

async function httpClearCart(req, res) {
  const userId = req.user.id;

  try {
    const result = await Cart.deleteMany({ userId: userId });

    return res.status(200).json({
      message: "Cart cleared",
      itemsRemoved: result.deletedCount,
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    return res.status(500).json({
      error: "Failed to clear cart",
    });
  }
}

module.exports = {
  httpAddToCart: httpAddToCart,
  httpGetCart: httpGetCart,
  httpUpdateCartItem: httpUpdateCartItem,
  httpRemoveCartItem: httpRemoveCartItem,
  httpClearCart: httpClearCart,
};
