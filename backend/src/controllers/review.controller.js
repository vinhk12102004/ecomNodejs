import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

function sanitizeText(input) {
  if (!input) return "";
  return String(input)
    .replace(/<[^>]*>/g, " ") // strip HTML tags
    .replace(/[\r\n\t]/g, " ")
    .trim()
    .slice(0, 2000);
}

// ⭐ Hàm tính và cập nhật rating trung bình từ reviews
async function updateProductRatingFromReviews(productId) {
  try {
    const result = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), stars: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$stars" }, count: { $sum: 1 } } }
    ]);

    const avgRating = result.length && result[0].count > 0 
      ? Number(result[0].avg.toFixed(2)) 
      : 0;

    await Product.findByIdAndUpdate(
      productId,
      { rating: avgRating },
      { new: true }
    );

    return avgRating;
  } catch (err) {
    console.error("Error updating product rating from reviews:", err);
    return 0;
  }
}

export async function createReview(req, res, next) {
  try {
    const { id: productId } = req.params;
    const { content, authorName, stars } = req.body || {};

    // Validate stars (required for new reviews)
    const starsValue = stars ? Number(stars) : null;
    if (!starsValue || starsValue < 1 || starsValue > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
    }

    const doc = await Review.create({
      product: productId,
      content: sanitizeText(content),
      authorName: sanitizeText(authorName).slice(0, 120) || undefined,
      stars: starsValue // ⭐ Lưu số sao (required)
    });

    // ⭐ Tự động cập nhật rating trung bình của product từ reviews
    await updateProductRatingFromReviews(productId);

    // Emit realtime event
    try {
      const io = req.app?.locals?.io;
      if (io) io.to(`product:${productId}`).emit('product:event', { type: 'review', payload: doc });
    } catch {}

    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
}

export async function listReviews(req, res, next) {
  try {
    const { id: productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: productId })
    ]);

    res.json({ data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}


