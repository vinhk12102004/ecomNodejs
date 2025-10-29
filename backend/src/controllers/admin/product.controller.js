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
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
