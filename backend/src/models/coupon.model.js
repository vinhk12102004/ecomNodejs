import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    usage_limit: {
      type: Number,
      default: 10,
      min: 1
    },
    used_count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");
export default Coupon;
