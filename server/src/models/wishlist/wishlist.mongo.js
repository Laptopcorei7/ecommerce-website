const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

wishListSchema.index({ userId: 1, productId: 1 }, { unique: true });

wishListSchema.index({ userId: 1, addedAt: -1 });

module.exports = mongoose.model("Wishlist", wishListSchema);
