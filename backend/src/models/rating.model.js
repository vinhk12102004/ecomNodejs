import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  stars: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

ratingSchema.index({ product: 1, user: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema, "ratings");

export default Rating;


