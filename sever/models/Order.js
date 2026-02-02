const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Order must include at least one item",
      },
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping: {
      phone_number: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    payment: {
      provider: {
        type: String,
        required: true,
        trim: true,
      },
      status: {
        type: String,
        required: true,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
    },
    order_status: {
      type: String,
      required: true,
      enum: ["created", "paid", "shipped", "delivered", "cancelled"],
      default: "created",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
