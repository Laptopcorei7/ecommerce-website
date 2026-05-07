const mongoose = require("mongoose");

const Wishlist = require("../models/wishlist/wishlist.mongo");
const Product = require("../models/product/product.mongo");
const Cart = require("../models/product/cart.mongo");

async function httpAddToWishlist(req, res) {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      error: "Product ID is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const existingItem = await Wishlist.findOne({
      userId: userId,
      productId: productId,
    });

    if (existingItem) {
      return res.status(400).json({
        error: "Product already in wishlist",
      });
    }

    const wishlistItem = new Wishlist({
      userId: userId,
      productId: productId,
    });

    await wishlistItem.save();

    return res.status(201).json({
      message: "Product added to wishlist",
      item: {
        id: wishlistItem._id,
        productId: wishlistItem.productId,
        addedAt: wishlistItem.addedAt,
      },
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: "Product already in wishlist",
      });
    }

    return res.status(500).json({
      error: "Failed to add product to wishlist",
    });
  }
}

async function httpGetWishlist(req, res) {
  const userId = req.user.id;

  try {
    const wishlistItems = await Wishlist.find({ userId: userId })
      .populate("productId")
      .sort({ addedAt: -1 });

    const formattedItems = wishlistItems
      .filter((item) => item.productId)
      .map((item) => ({
        id: item._id,
        product: {
          id: item.productId._id,
          name: item.productId.name,
          description: item.productId.description,
          price: item.productId.price,
          category: item.productId.category,
          stock: item.productId.stock,
          images: item.productId.images,
          brand: item.productId.brand,
          averageRating: item.productId.averageRating,
        },
        addedAt: item.addedAt,
      }));

    return res.status(200).json({
      count: formattedItems.length,
      items: formattedItems,
    });
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({
      error: "Failed to get wishlist",
    });
  }
}

async function httpRemoveFromWishlist(req, res) {
  const userId = req.user.id;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({
      error: "Product not found in wishlist",
    });
  }

  try {
    const result = await Wishlist.findOneAndDelete({
      userId: userId,
      productId: productId,
    });

    if (!result) {
      return res.status(404).json({
        error: "Product not found wishlist",
      });
    }

    return res.status(200).json({
      message: "Product removed from wishlist",
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res.status(500).json({
      error: "Failed to remove product from wishlist",
    });
  }
}

async function httpClearWishlist(req, res) {
  const userId = req.user.id;

  try {
    const result = await Wishlist.deleteMany({ userId: userId });

    return res.status(200).json({
      message: "Wishlist cleared",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Clear wishlist error:", err);
    return res.status(500).json({
      error: "Failed to clear wishlist",
    });
  }
}

async function httpMoveToCart(req, res) {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      error: "Quantity must be a positive integer",
    });
  }

  try {
    const wishlistItem = await Wishlist.findOne({
      userId: userId,
      productId: productId,
    });

    if (!wishlistItem) {
      return res.status(404).json({
        error: "Product not found in wishlist",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
      });
    }

    let cartItem = await Cart.findOne({
      userId: userId,
      productId: productId,
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          error: "insufficient stock for total quantity",
          available: product.stock,
          currentInCart: cartItem.quantity,
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId: userId,
        productId: productId,
        quantity: quantity,
      });

      await cartItem.save();
    }

    await Wishlist.findByIdAndDelete(wishlistItem._id);

    return res.status(200).json({
      message: "Product moved to cart",
      cart: {
        id: cartItem._id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      },
    });
  } catch (err) {
    console.error("Move to cart error:", err);
    return res.status(500).json({
      error: "Failed to move product to cart",
    });
  }
}

module.exports = {
  httpAddToWishlist: httpAddToWishlist,
  httpGetWishlist: httpGetWishlist,
  httpRemoveFromWishlist: httpRemoveFromWishlist,
  httpClearWishlist: httpClearWishlist,
  httpMoveToCart: httpMoveToCart,
};
