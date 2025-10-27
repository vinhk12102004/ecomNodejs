import Product from "../models/product.model.js";

export const listProducts = async (req, res, next) => {
  try {
    const { page, limit, q, brand, minPrice, maxPrice, minRamGB, sort } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Text search
    if (q) {
      filter.$text = { $search: q };
    }
    
    // Brand filter
    if (brand && brand.length > 0) {
      filter.brand = { $in: brand };
    }
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    
    // RAM filter
    if (minRamGB !== undefined) {
      filter["specs.ramGB"] = { $gte: minRamGB };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    res.json({
      data: items,
      meta: {
        total,
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).lean();
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};

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
