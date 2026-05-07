const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
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

    quantity: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

cartSchema.virtual("subtotal").get(function () {
  return this.quantity * this.price;
});

cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
