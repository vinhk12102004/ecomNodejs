import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  recipient: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  district: { type: String, trim: true },
  ward: { type: String, trim: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true, timestamps: true });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  // Optional when logging in via OAuth
  password_hash: { type: String, required: function() { return !this.oauthProvider; } },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  name: { type: String },
  totalPoints: { type: Number, default: 0 },
  oauthProvider: { type: String, enum: ["google", "facebook"], default: null },
  oauthSub: { type: String, default: null, index: true },
  // Password reset token (one-time use)
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  addresses: [addressSchema]
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

export default mongoose.model("User", userSchema);
