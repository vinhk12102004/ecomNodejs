import Product from "../../models/product.model.js";
import { getPaging } from "../../services/paging.util.js";

export async function listProducts(req, res) {
  try {
    const { page, limit, skip } = getPaging(req);
    const total = await Product.countDocuments();
    const data = await Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ page, limit, total, pages: Math.ceil(total / limit), data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createProduct(req, res) {
  try {
    const { images, description } = req.body;

    // Validate images array
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ 
        error: 'images field is required and must be an array' 
      });
    }

    if (images.length < 3) {
      return res.status(400).json({ 
        error: 'Product must have at least 3 images' 
      });
    }

    // Validate description length
    if (!description || description.trim().length < 200) {
      return res.status(400).json({ 
        error: 'Description must be at least 200 characters (~5 lines)' 
      });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { images, description } = req.body;

    // Validate images if provided
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({ 
          error: 'images field must be an array' 
        });
      }

      if (images.length < 3) {
        return res.status(400).json({ 
          error: 'Product must have at least 3 images' 
        });
      }
    }

    // Validate description if provided
    if (description !== undefined && description.trim().length < 200) {
      return res.status(400).json({ 
        error: 'Description must be at least 200 characters (~5 lines)' 
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
