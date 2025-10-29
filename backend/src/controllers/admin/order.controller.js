import Order from "../../models/order.model.js";
import { getPaging } from "../../services/paging.util.js";
import { getDateRange } from "../../services/dateRange.util.js";

export async function list(req, res) {
  try {
    const { page, limit, skip } = getPaging(req);
    const { start, end } = getDateRange(req);
    const filter = { createdAt: { $gte: start, $lte: end } };

    const total = await Order.countDocuments(filter);
    const data = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "email name");

    res.json({ page, limit, total, pages: Math.ceil(total / limit), data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function detail(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate("user", "email name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status || order.status;
    order.statusHistory.unshift({ status: order.status, at: new Date() });
    await order.save();

    res.json({ message: "Status updated", orderId: order._id, status: order.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
