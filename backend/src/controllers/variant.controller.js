import ProductVariant from "../models/productVariant.model.js";
import Product from "../models/product.model.js";

/**
 * GET /products/:id/variants
 * List all variants for a product
 */
export async function listByProduct(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const skip = (page - 1) * limit;

    const [variants, total] = await Promise.all([
      ProductVariant.find({ product: id, isActive: true })
        .sort({ 'attributes.ramGB': 1, 'attributes.storageGB': 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProductVariant.countDocuments({ product: id, isActive: true })
    ]);

    res.json({
      data: variants,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('List variants error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /variants/:sku
 * Get single variant by SKU
 */
export async function getVariantBySku(req, res) {
  try {
    const { sku } = req.params;

    const variant = await ProductVariant.findOne({ sku: sku.toUpperCase() })
      .populate('product', 'name brand image description')
      .lean();

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    if (!variant.isActive) {
      return res.status(404).json({ error: "Variant is not available" });
    }

    res.json({ data: variant });
  } catch (err) {
    console.error('Get variant error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /admin/products/:id/variants
 * Create new variant (Admin only)
 */
export async function create(req, res) {
  try {
    const { id } = req.params;
    const { sku, name, price, stock, attributes } = req.body;

    // Validate required fields
    if (!sku || !name || price === undefined || stock === undefined || !attributes) {
      return res.status(400).json({ 
        error: "Missing required fields: sku, name, price, stock, attributes" 
      });
    }

    // Validate product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ error: "Cannot add variant to inactive product" });
    }

    // Validate attributes
    if (!attributes.ramGB || !attributes.storageGB || !attributes.color) {
      return res.status(400).json({ 
        error: "Attributes must include ramGB, storageGB, and color" 
      });
    }

    // Check if SKU already exists
    const existingSku = await ProductVariant.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ error: "SKU already exists" });
    }

    // Create variant
    const variant = await ProductVariant.create({
      product: id,
      sku: sku.toUpperCase(),
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      attributes: {
        ramGB: parseInt(attributes.ramGB),
        storageGB: parseInt(attributes.storageGB),
        color: attributes.color.trim()
      }
    });

    res.status(201).json({ 
      data: variant,
      message: "Variant created successfully"
    });
  } catch (err) {
    console.error('Create variant error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ error: "SKU already exists" });
    }
    
    res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /admin/variants/:sku
 * Update variant (Admin only)
 */
export async function update(req, res) {
  try {
    const { sku } = req.params;
    const updates = req.body;

    // Don't allow updating product or sku
    delete updates.product;
    delete updates.sku;
    delete updates.createdAt;
    delete updates.updatedAt;

    const variant = await ProductVariant.findOne({ sku: sku.toUpperCase() });
    
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    // Update fields
    if (updates.name !== undefined) variant.name = updates.name.trim();
    if (updates.price !== undefined) variant.price = parseFloat(updates.price);
    if (updates.stock !== undefined) variant.stock = parseInt(updates.stock);
    if (updates.isActive !== undefined) variant.isActive = Boolean(updates.isActive);
    
    if (updates.attributes) {
      if (updates.attributes.ramGB !== undefined) {
        variant.attributes.ramGB = parseInt(updates.attributes.ramGB);
      }
      if (updates.attributes.storageGB !== undefined) {
        variant.attributes.storageGB = parseInt(updates.attributes.storageGB);
      }
      if (updates.attributes.color !== undefined) {
        variant.attributes.color = updates.attributes.color.trim();
      }
    }

    await variant.save();

    res.json({ 
      data: variant,
      message: "Variant updated successfully"
    });
  } catch (err) {
    console.error('Update variant error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /admin/variants/:sku
 * Delete/deactivate variant (Admin only)
 */
export async function remove(req, res) {
  try {
    const { sku } = req.params;
    const { permanent = false } = req.query;

    const variant = await ProductVariant.findOne({ sku: sku.toUpperCase() });
    
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    if (permanent === 'true') {
      // Permanent delete (use with caution)
      await ProductVariant.deleteOne({ sku: sku.toUpperCase() });
      return res.json({ message: "Variant permanently deleted" });
    } else {
      // Soft delete - just mark as inactive
      variant.isActive = false;
      variant.stock = 0;
      await variant.save();
      
      return res.json({ 
        data: variant,
        message: "Variant deactivated successfully"
      });
    }
  } catch (err) {
    console.error('Delete variant error:', err);
    res.status(500).json({ error: err.message });
  }
}

