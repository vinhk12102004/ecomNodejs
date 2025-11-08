import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const orderStatusSchema = new mongoose.Schema(
  {
    status: String,
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    subtotal: Number,
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discountValue: { type: Number, default: 0 },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    pointsRedeemed: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    total: Number
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestEmail: String,
    items: [orderItemSchema],
    pricing: pricingSchema,
    totalAmount: { type: Number, required: true },
    profitAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending"
    },
    statusHistory: [orderStatusSchema],
    // Payment fields
    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay", "other"],
      default: "cod"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    paymentInfo: {
      vnpTransactionNo: String, // VNPAY transaction number
      vnpBankCode: String, // Bank code used
      vnpCardType: String, // Card type
      vnpPayDate: String, // Payment date from VNPAY
      vnpResponseCode: String, // Response code (00 = success)
      vnpTxnRef: String // Transaction reference
    }
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema, "orders");
export default Order;
