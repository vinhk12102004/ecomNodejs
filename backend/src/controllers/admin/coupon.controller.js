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
    const { code, discountPercent, usage_limit } = req.body;

    // Validate code format before creating
    if (!code) {
      return res.status(400).json({ 
        error: 'Coupon code is required' 
      });
    }

    const upperCode = code.toUpperCase().trim();

    // Validate code format (5 alphanumeric uppercase)
    if (!/^[A-Z0-9]{5}$/.test(upperCode)) {
      return res.status(400).json({ 
        error: 'CODE must be 5 alphanumeric uppercase characters (A-Z, 0-9). Example: ABC12, SAVE5' 
      });
    }

    // Validate usage_limit
    if (usage_limit !== undefined) {
      const limit = parseInt(usage_limit);
      if (isNaN(limit) || limit < 1 || limit > 10) {
        return res.status(400).json({ 
          error: 'usage_limit must be between 1 and 10' 
        });
      }
    }

    // Validate discountPercent
    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({ 
        error: 'discountPercent must be between 1 and 100' 
      });
    }

    const coupon = await Coupon.create({ 
      code: upperCode,
      discountPercent,
      usage_limit: usage_limit || 10,
      used_count: 0 
    });

    res.status(201).json(coupon);
  } catch (e) {
    // Handle duplicate key error
    if (e.code === 11000) {
      return res.status(400).json({ 
        error: 'Coupon code already exists' 
      });
    }
    res.status(400).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const { code, usage_limit, discountPercent } = req.body;
    const updates = {};

    // Validate and update code if provided
    if (code !== undefined) {
      const upperCode = code.toUpperCase().trim();
      
      // Validate code format (5 alphanumeric uppercase)
      if (!/^[A-Z0-9]{5}$/.test(upperCode)) {
        return res.status(400).json({ 
          error: 'CODE must be 5 alphanumeric uppercase characters (A-Z, 0-9). Example: ABC12, SAVE5' 
        });
      }
      
      updates.code = upperCode;
    }

    // Validate and update usage_limit if provided
    if (usage_limit !== undefined) {
      const limit = parseInt(usage_limit);
      if (isNaN(limit) || limit < 1 || limit > 10) {
        return res.status(400).json({ 
          error: 'usage_limit must be between 1 and 10' 
        });
      }
      updates.usage_limit = limit;
    }

    // Validate and update discountPercent if provided
    if (discountPercent !== undefined) {
      const percent = parseInt(discountPercent);
      if (isNaN(percent) || percent < 1 || percent > 100) {
        return res.status(400).json({ 
          error: 'discountPercent must be between 1 and 100' 
        });
      }
      updates.discountPercent = percent;
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    
    res.json(coupon);
  } catch (e) {
    // Handle duplicate key error
    if (e.code === 11000) {
      return res.status(400).json({ 
        error: 'Coupon code already exists' 
      });
    }
    res.status(400).json({ error: e.message });
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
