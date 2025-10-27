import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  name: { type: String }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

export default mongoose.model("User", userSchema);
