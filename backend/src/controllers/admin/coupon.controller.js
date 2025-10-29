import Coupon from "../../models/coupon.model.js";
import Order from "../../models/order.model.js";
import { getPaging } from "../../services/paging.util.js";

export async function list(req, res) {
  const { page, limit, skip } = getPaging(req);
  const total = await Coupon.countDocuments();
  const data = await Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.json({ page, limit, total, pages: Math.ceil(total / limit), data });
}

export async function create(req, res) {
  try {
    const c = await Coupon.create({ ...req.body, used_count: 0 });
    res.status(201).json(c);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function update(req, res) {
  try {
    const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: "Not found" });
    res.json(c);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function remove(req, res) {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}

export async function usageStats(req, res) {
  const orders = await Order.find({ "pricing.couponId": req.params.id }).select("_id totalAmount createdAt user");
  res.json({ count: orders.length, orders });
}
