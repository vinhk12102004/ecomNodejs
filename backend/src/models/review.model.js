import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  authorName: { type: String, trim: true, maxlength: 120 }
}, { timestamps: true });

reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema, "reviews");

export default Review;


