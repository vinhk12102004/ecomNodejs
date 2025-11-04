import Review from "../models/review.model.js";

function sanitizeText(input) {
  if (!input) return "";
  return String(input)
    .replace(/<[^>]*>/g, " ") // strip HTML tags
    .replace(/[\r\n\t]/g, " ")
    .trim()
    .slice(0, 2000);
}

export async function createReview(req, res, next) {
  try {
    const { id: productId } = req.params;
    const { content, authorName } = req.body || {};

    const doc = await Review.create({
      product: productId,
      content: sanitizeText(content),
      authorName: sanitizeText(authorName).slice(0, 120) || undefined
    });

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


