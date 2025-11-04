import Rating from "../models/rating.model.js";

export async function upsertRating(req, res, next) {
  try {
    const { id: productId } = req.params;
    const userId = req.user?._id;
    const { stars } = req.body || {};

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const val = Number(stars);
    if (!(val >= 1 && val <= 5)) return res.status(400).json({ error: "stars must be 1..5" });

    const doc = await Rating.findOneAndUpdate(
      { product: productId, user: userId },
      { $set: { stars: val } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    // Emit realtime event
    try {
      const io = req.app?.locals?.io;
      if (io) io.to(`product:${productId}`).emit('product:event', { type: 'rating', payload: doc });
    } catch {}

    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
}

export async function getMyRating(req, res, next) {
  try {
    const { id: productId } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const doc = await Rating.findOne({ product: productId, user: userId }).lean();
    res.json({ data: doc || null });
  } catch (err) {
    next(err);
  }
}


