import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import Rating from "../models/rating.model.js";

/**
 * GET /api/products
 * List products with filters, search, sorting, and pagination
 */
export const listProducts = async (req, res, next) => {
  try {
    // ✅ Parse & normalize query parameters
    const {
      page: rawPage = 1,
      limit: rawLimit = 20,
      q,
      search,
      brand,
      category,
      tags,
      minPrice,
      maxPrice,
      minRamGB,
      ratingGte,
      sort
    } = req.query;

    const page = parseInt(rawPage) || 1;
    const limit = parseInt(rawLimit) || 20;

    // ✅ Build filter object
    const filter = {};

    // Text search (support both ?q= and ?search=)
    const searchTerm = q || search;
    if (searchTerm) {
      // escape các ký tự đặc biệt trong regex
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i"); // i = không phân biệt hoa thường

      filter.$or = [
        { name: regex },
        { brand: regex },
        { tags: regex },         
   
      ];
    }

    // Brand filter
    if (brand && brand.length > 0) {
      // nếu brand truyền lên dạng string, chuyển về mảng
      const brands = Array.isArray(brand) ? brand : [brand];
      filter.brand = { $in: brands };
    }

    // Category filter
    if (category && category.length > 0) {
      const categories = Array.isArray(category) ? category : [category];
      filter.category = { $in: categories };
    }

    // Tags filter (sản phẩm có chứa bất kỳ tag nào trong danh sách)
    if (tags && tags.length > 0) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagsArray };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // RAM filter
    if (minRamGB !== undefined) {
      filter["specs.ramGB"] = { $gte: Number(minRamGB) };
    }

    // Rating filter (>=3, >=4, or =5)
    if (ratingGte !== undefined) {
      const rating = parseFloat(ratingGte);
      if (!isNaN(rating)) filter.rating = { $gte: rating };
    }

    // ✅ Calculate pagination safely
    const skip = (page - 1) * limit;

    // ✅ Execute DB queries concurrently
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    // ✅ Send response with pagination metadata
    res.json({
      data: items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) // thêm để frontend hiển thị pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Get single product detail with average rating & review count
 */
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Aggregate ratings and reviews count
    const [ratingAgg, reviewsCount] = await Promise.all([
      Rating.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: "$product", avgStars: { $avg: "$stars" } } }
      ]),
      Review.countDocuments({ product: product._id })
    ]);

    const avgRating = ratingAgg.length
      ? Math.round(ratingAgg[0].avgStars * 10) / 10
      : 0;

    res.json({ data: { ...product, avgRating, reviewsCount } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products
 * Create a new product
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/products/:id
 * Update existing product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id).lean();

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ data: { deleted: true } });
  } catch (error) {
    next(error);
  }
};
