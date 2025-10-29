import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    skuId: {
      type: String,
      default: null // For future variant support
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtAdd: {
      type: Number,
      required: true,
      min: 0
    },
    // Snapshots for display even if product changes
    nameSnapshot: {
      type: String,
      default: null
    },
    imageSnapshot: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true // allows null values in unique index
    },
    guestToken: {
      type: String,
      sparse: true,
      index: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

// Compound unique index: either userId OR guestToken (not both)
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestToken: 1 }, { unique: true, sparse: true });

// Ensure either userId or guestToken exists
cartSchema.pre('save', function(next) {
  if (!this.userId && !this.guestToken) {
    return next(new Error('Cart must have either userId or guestToken'));
  }
  if (this.userId && this.guestToken) {
    return next(new Error('Cart cannot have both userId and guestToken'));
  }
  next();
});

const Cart = mongoose.model("Cart", cartSchema, "carts");

export default Cart;

