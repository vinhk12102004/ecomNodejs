import Order from "../models/order.model.js";
import { getPaging } from "../services/paging.util.js";

/**
 * GET /orders/my
 * List orders for current authenticated user
 * Query: ?page=1&limit=20
 */
export async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page, limit, skip } = getPaging(req, { defaultLimit: 20 });
    
    const filter = { user: userId };
    const total = await Order.countDocuments(filter);
    
    const data = await Order.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate itemsCount for each order
    const ordersWithCount = data.map(order => ({
      ...order,
      itemsCount: order.items?.length || 0
    }));

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: ordersWithCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /orders/:id
 * Get order detail by ID (must belong to current user)
 */
export async function getMyOrderDetail(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const order = await Order.findOne({ _id: id, user: userId }).lean();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Sort statusHistory reverse chronological (most recent first)
    if (order.statusHistory) {
      order.statusHistory = [...order.statusHistory].sort(
        (a, b) => new Date(b.at) - new Date(a.at)
      );
    }

    res.json({ data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

