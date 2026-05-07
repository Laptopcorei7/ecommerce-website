const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
