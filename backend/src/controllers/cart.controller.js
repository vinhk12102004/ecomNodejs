import * as cartService from "../services/cart.service.js";

/**
 * GET /cart - Get current cart
 */
export async function getCart(req, res) {
  try {
    const userId = req.user?.id;
    const guestToken = req.guestToken;

    const cart = await cartService.getCart({ userId, guestToken });

    res.json(cart);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * GET /cart/count - Get cart item count (for badge)
 */
export async function getCartCount(req, res) {
  try {
    const userId = req.user?.id;
    const guestToken = req.guestToken;

    const result = await cartService.getCartCount({ userId, guestToken });

    res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * POST /cart/items - Add item to cart (MERGE logic)
 * Body: { productId, skuId?, qty }
 */
export async function addItem(req, res) {
  try {
    const { productId, skuId, qty = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    if (qty < 1) {
      return res.status(400).json({ error: "qty must be at least 1" });
    }

    const userId = req.user?.id;
    const guestToken = req.guestToken;

    const cart = await cartService.addItem({
      userId,
      guestToken,
      productId,
      skuId,
      qty
    });

    res.status(200).json(cart);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * POST /cart/items/bulk - Bulk add items to cart
 * Body: { items: [{ productId, skuId?, qty }] }
 */
export async function bulkAddItems(req, res) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items must be a non-empty array" });
    }

    const userId = req.user?.id;
    const guestToken = req.guestToken;

    const result = await cartService.bulkAddItems({ 
      userId, 
      guestToken, 
      items 
    });

    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * PATCH /cart/items/:productId - Update item quantity
 * Body: { qty, skuId? }
 */
export async function updateItemQty(req, res) {
  try {
    const { productId } = req.params;
    const { qty, skuId } = req.body;

    if (!qty || qty < 1) {
      return res.status(400).json({ error: "qty must be at least 1" });
    }

    const userId = req.user?.id;
    const guestToken = req.guestToken;

    const cart = await cartService.updateItemQty({
      userId,
      guestToken,
      productId,
      skuId,
      qty
    });

    res.json(cart);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * DELETE /cart/items/:productId - Remove item from cart
 * Query: ?skuId=xxx (optional)
 */
export async function removeItem(req, res) {
  try {
    const { productId } = req.params;
    const { skuId } = req.query;
    
    const userId = req.user?.id;
    const guestToken = req.guestToken;

    const cart = await cartService.removeItem({
      userId,
      guestToken,
      productId,
      skuId
    });

    res.json(cart);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * DELETE /cart - Clear entire cart
 */
export async function clearCart(req, res) {
  try {
    const userId = req.user?.id;
    const guestToken = req.guestToken;

    await cartService.clearCart({ userId, guestToken });

    res.json({ 
      message: "Cart cleared successfully",
      items: [],
      subtotal: 0,
      count: 0
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}
