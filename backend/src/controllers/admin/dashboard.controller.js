import Order from "../../models/order.model.js";
import User from "../../models/user.model.js";
import Product from "../../models/product.model.js";
import { getDateRange } from "../../services/dateRange.util.js";

export async function getSimple(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Calculate new users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers7d = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const revenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const bestSellers = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", sold: { $sum: "$items.quantity" } } },
      { $sort: { sold: -1 } },
      { $limit: 5 }
    ]);

    res.json({ totalUsers, newUsers7d, totalOrders, totalProducts, totalRevenue, bestSellers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAdvanced(req, res) {
  try {
    const { start, end } = getDateRange(req);
    const period = (req.query.period || "year").toLowerCase();

    const dateExpr = {
      year: { $dateToString: { format: "%Y", date: "$createdAt" } },
      month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      week: { $dateToString: { format: "%G-W%V", date: "$createdAt" } }
    }[period] || { $dateToString: { format: "%Y", date: "$createdAt" } };

    const byTime = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: dateExpr,
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$profitAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ range: { start, end }, period, byTime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
