const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name must not exceed 100 characters."],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must not exceed 1000 characters"],
    },

    price: {
      type: Number,
      required: [true, " Price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Electronics", "Clothing", "Books", "Home", "Sports", "Other"],
        message:
          "Category must be one of: Electronic, Clothing, Books, Home, Sports, Other",
      },
    },

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    brand: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      trim: true,
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
