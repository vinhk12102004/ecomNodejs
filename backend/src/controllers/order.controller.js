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
 * Get order detail by ID
 * - If user is authenticated, order must belong to user
 * - If user is not authenticated (guest), allow access by order ID (for VNPAY return)
 */
export async function getMyOrderDetail(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    let order;

    if (userId) {
      // Authenticated user: order must belong to user
      order = await Order.findOne({ _id: id, user: userId }).lean();
    } else {
      // Guest user: allow access by order ID (for VNPAY return page)
      // This is safe because order ID is already in the URL from VNPAY redirect
      order = await Order.findById(id).lean();
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // For guest users, verify they have access (order has no user or guest email)
    if (!userId && order.user) {
      // Order belongs to a user, guest cannot access
      return res.status(403).json({ error: "Access denied" });
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

