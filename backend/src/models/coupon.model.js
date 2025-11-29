import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [5, 'CODE must be exactly 5 characters'],
      maxlength: [5, 'CODE must be exactly 5 characters'],
      validate: {
        validator: function(v) {
          return /^[A-Z0-9]{5}$/.test(v);
        },
        message: 'CODE must be 5 alphanumeric uppercase characters (A-Z, 0-9)'
      }
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
      min: [1, 'usage_limit must be at least 1'],
      max: [10, 'usage_limit must be at most 10'],
      required: true
    },
    used_count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

// Pre-save validation
couponSchema.pre('save', function(next) {
  // Ensure code is uppercase
  if (this.code) {
    this.code = this.code.toUpperCase().trim();
  }
  
  // Validate code format
  if (this.code && !/^[A-Z0-9]{5}$/.test(this.code)) {
    return next(new Error('CODE must be 5 alphanumeric uppercase characters (A-Z, 0-9)'));
  }
  
  // Validate usage_limit
  if (this.usage_limit && (this.usage_limit < 1 || this.usage_limit > 10)) {
    return next(new Error('usage_limit must be between 1 and 10'));
  }
  
  next();
});

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");
export default Coupon;
