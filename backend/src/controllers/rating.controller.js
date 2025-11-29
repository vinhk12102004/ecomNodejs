// controllers/rating.controller.js
import Rating from "../models/rating.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// Tạo ID khách ẩn danh
function makeGuestId(req) {
  const raw = (req.ip || "") + (req.headers["user-agent"] || "");
  const hex = Buffer.from(raw).toString("hex").slice(0, 24);
  return new mongoose.Types.ObjectId(hex.padEnd(24, "0"));
}

// ⭐ Hàm cập nhật rating trung bình cho product
async function updateProductAverage(productId) {
  const result = await Rating.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$stars" } } }
  ]);

  const avgRating = result.length ? Number(result[0].avg.toFixed(2)) : 0;

  await Product.findByIdAndUpdate(
    productId,
    { rating: avgRating },
    { new: true }
  );

  return avgRating;
}

export async function upsertRating(req, res, next) {
  try {
    const { id: productId } = req.params;
    const { stars } = req.body || {};

    // ⭐ user hoặc guest
    const userId = req.user?._id || makeGuestId(req);

    const val = Number(stars);
    if (!(val >= 1 && val <= 5)) {
      return res.status(400).json({ error: "Rating must be 1–5" });
    }

    // ⭐ Upsert rating
    const doc = await Rating.findOneAndUpdate(
      { product: productId, user: userId },
      { $set: { stars: val } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    // ⭐ Auto update product rating
    const newAvg = await updateProductAverage(productId);

    res.status(201).json({
      data: doc,
      newAverage: newAvg
    });

  } catch (err) {
    next(err);
  }
}

export async function getMyRating(req, res, next) {
  try {
    const { id: productId } = req.params;
    const userId = req.user?._id || makeGuestId(req);

    const rating = await Rating.findOne({
      product: productId,
      user: userId
    }).lean();

    res.json({ data: rating || null });
  } catch (err) {
    next(err);
  }
}
